using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.FileManager.Base;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EJ2AmazonS3ASPCoreFileProvider.Services
{
    public interface IAmazonS3DocumentStorageService
    {
        object ManageDocument(FileManagerDirectoryContent args);
        object DownloadDocument(FileManagerDirectoryContent args);
        Task<IActionResult> FetchDocumentAsync(string documentName);
        Task<IActionResult> UploadDocumentAsync(IFormFile file, string documentName);
    }
}