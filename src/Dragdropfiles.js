import { useState, useRef } from "react";

const DragdropFiles = () => {
  const [files, setFiles] = useState(null);
  const inputRef = useRef();

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedItems = event.dataTransfer.items;
    const itemArray = Array.from(droppedItems);
    const folderStructure = [];

    // Recursive function to retrieve folder structure and contents
    const getFolderStructure = (entry, path = "") => {
      const reader = entry.createReader();
      reader.readEntries((entries) => {
        const folderContents = [];
        entries.forEach((subEntry) => {
          if (subEntry.isFile) {
            folderContents.push(subEntry);
          } else if (subEntry.isDirectory) {
            const folderPath = `${path}${subEntry.name}/`;
            folderStructure.push({ path: folderPath, contents: [] });
            getFolderStructure(subEntry, folderPath);
          }
        });
        const currentFolder = folderStructure.find(
          (folder) => folder.path === path
        );
        if (currentFolder) {
          currentFolder.contents = folderContents;
        }
      });
    };

    // Check if the dropped item is a folder
    if (itemArray[0].webkitGetAsEntry) {
      const entry = itemArray[0].webkitGetAsEntry();
      if (entry && entry.isDirectory) {
        getFolderStructure(entry);
        setFiles(folderStructure);
        return;
      }
    }

    // If not a folder, add individual files to the files state
    const droppedFiles = event.dataTransfer.files;
    setFiles([{ path: "/", contents: droppedFiles }]);
  };

  // send files to the server // learn from my other video
  // create FormData and append files to it, then send through fetch/axios
  const handleUpload = () => {
    const formData = new FormData();
    files.forEach((folder) => {
      folder.contents.forEach((file) => {
        formData.append("Files", file);
      });
    });
    console.log(formData.getAll());
    // fetch("link", {
    //   method: "POST",
    //   body: formData
    // });
  };

  if (files) {
    return (
      <div className="uploads">
        <ul>
          {files.map((folder, folderIdx) => (
            <li key={folderIdx}>
              <strong>{folder.path}</strong>
              <ul>
                {folder.contents.map((file, fileIdx) => (
                  <li key={fileIdx}>{file.name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="actions">
          <button onClick={() => setFiles(null)}>Cancel</button>
          <button onClick={handleUpload}>Upload</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dropzone" onDragOver={handleDragOver} onDrop={handleDrop}>
        <h1>Drag and Drop Files to Upload</h1>
        <h1>Or</h1>
        <input
          type="file"
          multiple
          onChange={(event) => setFiles(event.target.files)}
          hidden
          // accept="image/png, image/jpeg"
          ref={inputRef}
        />
        <button onClick={() => inputRef.current.click()}>Select Files</button>
      </div>
    </>
  );
};

export default DragdropFiles;
