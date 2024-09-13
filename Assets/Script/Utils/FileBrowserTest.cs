using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.IO;
using SimpleFileBrowser;

public class FileBrowserTest : MonoBehaviour
{
    public Text filePathText; // Reference to the Text UI element to display the file path
    public Button openFileDialogButton; // Reference to the button that opens the file dialog

    void Start()
    {
        // Set up the file browser configuration
        FileBrowser.SetFilters(true, new FileBrowser.Filter("Images", ".jpg", ".png"), new FileBrowser.Filter("Text Files", ".txt", ".pdf"));
        FileBrowser.SetDefaultFilter(".jpg");
        FileBrowser.SetExcludedExtensions(".lnk", ".tmp", ".zip", ".rar", ".exe");
        FileBrowser.AddQuickLink("Users", "C:\\Users", null);

        // Add listener to the button
        openFileDialogButton.onClick.AddListener(OpenFileBrowser);
    }

    void OpenFileBrowser()
    {
        StartCoroutine(ShowLoadDialogCoroutine());
    }

    IEnumerator ShowLoadDialogCoroutine()
    {
        yield return FileBrowser.WaitForLoadDialog(FileBrowser.PickMode.Files, true, null, null, "Select Files", "Load");

        if (FileBrowser.Success)
            OnFilesSelected(FileBrowser.Result);
        else
            filePathText.text = "Operation canceled or failed.";
    }

    void OnFilesSelected(string[] filePaths)
    {
        // Display the path of the first selected file
        if (filePaths.Length > 0)
        {
            filePathText.text = filePaths[0];
            Debug.Log("Selected file path: " + filePaths[0]);

            // Read the bytes of the first file
            byte[] bytes = FileBrowserHelpers.ReadBytesFromFile(filePaths[0]);

            // Optionally, copy the file to persistentDataPath
            string destinationPath = Path.Combine(Application.persistentDataPath, FileBrowserHelpers.GetFilename(filePaths[0]));
            FileBrowserHelpers.CopyFile(filePaths[0], destinationPath);
        }
        else
        {
            filePathText.text = "No files selected.";
        }
    }
}
