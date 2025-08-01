using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.FileManager.Base;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using EJ2AmazonS3ASPCoreFileProvider.Services;
using System;

namespace EJ2AmazonS3ASPCoreFileProvider.Controllers
{
    /// <summary>
    /// Controller for handling Aws file operations and document management
    /// </summary>
    [Route("api/[controller]")]
    [EnableCors("AllowAllOrigins")]
    public class AmazonS3DocumentStorageController : ControllerBase
    {
        private readonly IAmazonS3DocumentStorageService _documentStorageService;

        /// <summary>
        /// Constructor injecting the file provider service dependency.
        /// </summary>
        /// <param name="documentStorageService">Service for performing file operations</param>
        public AmazonS3DocumentStorageController(IAmazonS3DocumentStorageService documentStorageService)
        {
            _documentStorageService = documentStorageService;
        }

        /// <summary>
        /// Handles file management operations (read, delete, copy, search)
        /// </summary>
        /// <param name="args">The file manager directory content parameters.</param>
        /// <returns>Result of the file operation.</returns>
        [HttpPost("ManageDocument")]
        public object ManageDocument([FromBody] FileManagerDirectoryContent args)
        {
            return _documentStorageService.ManageDocument(args);
        }

        /// <summary>
        /// Downloads selected files from Amazon S3 file manager.
        /// </summary>
        /// <param name="downloadInput">The serialized file details for download.</param>
        /// <returns>The file stream or null if input is invalid.</returns>
        [HttpPost("DownloadDocument")]
        public object DownloadDocument(string downloadInput)
        {
            if(downloadInput!=null)
            {
                // Set serializer options to use camelCase naming policy.
                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                // Deserialize the JSON string to a FileManagerDirectoryContent object
                var args = JsonSerializer.Deserialize<FileManagerDirectoryContent>(downloadInput, options);
                return _documentStorageService.DownloadDocument(args);
            }
            // Return null if input is not provided
            return null;
        }

        /// <summary>
        /// Retrieves a document from Amazon S3 storage in JSON format.
        /// </summary>
        /// <param name="args">File operation parameters including path and action type</param>
        /// <returns>Result of the file operation</returns>
        [HttpPost("FetchDocument")]
        public async Task<IActionResult> FetchDocument([FromBody] Dictionary<string, string> jsonObject)
        {
            if (!jsonObject.TryGetValue("documentName", out var docName))
                return BadRequest("Document name required");

            return await _documentStorageService.FetchDocumentAsync(docName);
        }

        /// <summary>
        /// Saves uploaded document to Amazon S3 storage.
        /// </summary>
        /// <param name="data">Form data containing file and document name</param>
        /// <returns>Action result indicating success or failure.</returns>
        [HttpPost("UploadDocument")]
        public async Task<IActionResult> UploadDocument([FromForm] IFormCollection data)
        {
            if (data.Files.Count == 0)
                return BadRequest("No file provided");

            var documentName = data.TryGetValue("documentName", out var values) && values.Count > 0 ? values[0] : string.Empty;
            return await _documentStorageService.UploadDocumentAsync(data.Files[0], documentName);
        }   

    }
}