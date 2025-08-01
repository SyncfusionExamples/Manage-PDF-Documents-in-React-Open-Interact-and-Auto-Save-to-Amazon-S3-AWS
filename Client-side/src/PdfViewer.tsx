import React, { useRef, useState } from 'react';
import {
    PdfViewerComponent, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, Annotation, TextSearch, FormFields, FormDesigner, Inject
} from '@syncfusion/ej2-react-pdfviewer';
import AwsFileManager from './AWSFileManager.tsx';

function PdfViewer() {
    // Reference to access PDF viewer methods
    const containerRef = useRef<PdfViewerComponent>(null);
    // State to track the current document name
    const [fileName, setFileName] = useState<string>('None');
    // API service base URL
    const hostUrl: string = "http://localhost:62869/";

    // Custom toolbar button for opening AWS file manager
    const OpenOption = {
        prefixIcon: 'e-icons e-folder',
        id: 'OpenFileManager',
        text: 'Save',
        tooltipText: 'Open file manager',
        align: 'Left'
    };

    // Auto-save function that sends the modified PDF to AWS storage
    const autoSave = async (): Promise<void> => {
        if (!containerRef.current) return;
        try {
            // Get the document as a binary blob
            const blob: Blob = await containerRef.current.saveAsBlob();
            let exportedDocument = blob;
            let formData: FormData = new FormData();
            formData.append('documentName', fileName);
            formData.append('data', exportedDocument);
            let req = new XMLHttpRequest();
            // Send document to backend API for AWS storage
            req.open(
                'POST',
                hostUrl + 'api/AmazonS3DocumentStorage/UploadDocument',
                true
            );
            req.onreadystatechange = () => {
                if (req.readyState === 4 && (req.status === 200 || req.status === 304)) {
                    // Auto save completed
                    // Success handler can be added here if needed
                }
            };
            req.send(formData);
        }
        catch (error) {
            console.error('Error saving document:', error);
        }
    };
    
    //Loads a PDF file from AWS S3 storage into the PDF viewer
    const loadFile = (filePath: string, fileType: string, fileName: string): void => {
        if (!containerRef.current) {
            console.error('PDF Viewer is not loaded yet.');
            return;
        }
        // Update state with the current document name
        setFileName(fileName);
        if (fileType === '.pdf') {
            // Fetch the PDF document from AWS S3 through our API
            fetch(hostUrl + 'api/AmazonS3DocumentStorage/FetchDocument', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                body: JSON.stringify({ documentName: fileName })
            })
                .then(response => {
                    if (response.status === 200 || response.status === 304) {
                        return response.blob();  // For PDFs, it's better to handle as blob
                    } else {
                        throw new Error('Error loading PDF document');
                    }
                })
                .then(blob => {
                    const pdfViewerDiv = document.getElementById("container");
                    if (pdfViewerDiv) {
                        pdfViewerDiv.style.display = "block";
                    }

                    // Create object URL from blob and load it in the PDF viewer
                    const objectUrl = URL.createObjectURL(blob);
                    containerRef.current?.load(objectUrl, null);
                })
                .catch(error => {
                    console.error('Error loading PDF document:', error);
                });
        } else {
            alert('The selected file type is not supported. Please select a PDF file.');
        }
    };

    // Handle toolbar button click events
    const toolbarClick = (args: any): void => {
        // Get a reference to the file manager open button
        const openButton = document.getElementById('openAwsBucketStorage');
        // Always check if containerRef.current exists before using it
        if (!containerRef.current) return;
        if (args.item !== undefined) {
            switch (args.item.id) {
                case 'OpenFileManager':
                    if (openButton) {
                        openButton.click(); // Trigger the file manager open button click
                    }
                    break;
                default:
                    break;
            }
        }
    };

    return (
        <div>
            {/* AWS File Manager component for browsing and selecting files */}
            <div>
                <AwsFileManager onFileSelect={loadFile} />
            </div>
            {/* PDF Viewer container */}
            <div id="pdf-viewer-div" style={{ display: "block" }}>
                <div id="pdf-header">
                    {fileName || 'None'}
                </div>
                {/* Syncfusion PDF Viewer component with various tools and capabilities */}
                <PdfViewerComponent
                    id="container"
                    ref={containerRef}
                    resourceUrl="https://cdn.syncfusion.com/ej2/26.2.11/dist/ej2-pdfviewer-lib"
                    style={{ height: '700px' }}
                    toolbarSettings={{
                        showTooltip: true,
                        toolbarItems: [OpenOption,'PageNavigationTool','MagnificationTool','PanTool','SelectionTool','SearchOption', 'PrintOption','UndoRedoTool','AnnotationEditTool','FormDesignerEditTool','CommentTool', 'SubmitForm','DownloadOption']
                    }}
                    toolbarClick={toolbarClick}
                    annotationAdd={autoSave}
                    formFieldAdd={autoSave}
                    addSignature={autoSave}
                    annotationPropertiesChange={autoSave}
                    formFieldPropertiesChange={autoSave}
                    commentStatusChanged={autoSave}
                    downloadFileName={fileName}
                    exportAnnotationFileName={fileName}
                >
                    {/* Inject required PDF viewer services and features */}
                    <Inject services={[
                        Toolbar,
                        Magnification,
                        Navigation,
                        Annotation,
                        LinkAnnotation,
                        BookmarkView,
                        ThumbnailView,
                        Print,
                        TextSelection,
                        TextSearch,
                        FormFields,
                        FormDesigner
                    ]} />
                </PdfViewerComponent>
            </div>
        </div>
    );
}

export default PdfViewer;