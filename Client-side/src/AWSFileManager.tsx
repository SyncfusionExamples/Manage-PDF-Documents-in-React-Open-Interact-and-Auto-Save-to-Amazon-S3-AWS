import * as React from 'react';
import { FileManagerComponent, Inject, NavigationPane, DetailsView, Toolbar } from '@syncfusion/ej2-react-filemanager';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

interface AwsProps {
    // Callback function triggered when a file is selected in the file manager
    onFileSelect: (filePath: string, fileType: string, fileName: string) => void;
}

const AwsFileManager: React.FC<AwsProps> = ({ onFileSelect }) => {
    // Base URL for backend API handling Azure file operations
    const hostUrl: string = "http://localhost:62869/";
    // State management for file manager dialog visibility
    const [showFileManager, setShowFileManager] = React.useState(true);
    // Reference to access FileManager component methods
    let fileManagerRef = React.useRef<FileManagerComponent>(null);

    // Shows the file manager when open button is clicked and clears the previous selection item
    const handleOpenButtonClick = () => {
        // Clear the previous selection
        if (fileManagerRef.current) {
            fileManagerRef.current.clearSelection();
            setTimeout(() => {
                fileManagerRef.current.refreshFiles();
            }, 100);
        }
        setShowFileManager(true);
    };

    // Handles file open event from file manager
    const handleFileOpen = (args: any) => {
        if (args.fileDetails.isFile) {
            const selectedPath = args.fileDetails.path || args.fileDetails.filterPath + args.fileDetails.name;
            const fileType = args.fileDetails.type;
            const fileName = args.fileDetails.name;
            onFileSelect(selectedPath, fileType, fileName); // Pass the file path and file type to load in the PDF viewer
            setShowFileManager(false); // Close the File Manager Dialog
        }
    };

    return (
        <div>
            <button id="openAwsBucketStorage" onClick={handleOpenButtonClick}>
                Open Aws file manager
            </button>

            {/* File Manager Dialog */}
            <DialogComponent
                id="dialog-component-sample"
                header="File Manager"
                visible={showFileManager}
                width="80%"
                height="80%"
                showCloseIcon={true}
                closeOnEscape={true}
                target="body"
                beforeClose={() => setShowFileManager(false)}
                onClose={() => setShowFileManager(false)} // Close the dialog when closed
            >
                <FileManagerComponent
                    id="aws-file"
                    ref={fileManagerRef}
                    ajaxSettings={{
                        url: hostUrl + 'api/AmazonS3DocumentStorage/ManageDocument',
                        downloadUrl: hostUrl + 'api/AmazonS3DocumentStorage/DownloadDocument',
                    }}
                    toolbarSettings={{
                        items: ['SortBy', 'Copy', 'Paste', 'Delete', 'Refresh', 'Download', 'Selection', 'View', 'Details']
                    }}
                    contextMenuSettings={{
                        file: ['Open', 'Copy', '|', 'Delete', 'Download', '|', 'Details'],
                        layout: ['SortBy', 'View', 'Refresh', '|', 'Paste', '|', '|', 'Details', '|', 'SelectAll'],
                        visible: true
                    }}
                    fileOpen={handleFileOpen} // Attach the fileOpen event

                >
                    <Inject services={[NavigationPane, DetailsView, Toolbar]} />
                </FileManagerComponent>
            </DialogComponent>
        </div>
    );
};

export default AwsFileManager;