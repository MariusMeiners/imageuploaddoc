import { useState } from "react";
import axios from "axios";
import "./App.css";

interface IFileWithObjectURL {
  file: File;
  objectURL: string;
}

function App() {
  // initial value for file is undefined because FileList (.files) of input element is empty
  const [fileWithObjectURL, setFileWithObjectURL] = useState<
    undefined | IFileWithObjectURL
  >(undefined);
  return (
    <div className="App">
      <div className="previewBox">
        {fileWithObjectURL && (
          <img src={fileWithObjectURL.objectURL} alt="preview" />
        )}
        {fileWithObjectURL && (
          <div>
            <p>{fileWithObjectURL.file.name}</p>
            <p>{fileWithObjectURL.file.size} bytes</p>
            {/* MIME type -> https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types */}
            <p>{fileWithObjectURL.file.type}</p>
          </div>
        )}
      </div>
      <form>
        <input
          /**
           * use onchange over input because:
           * The input event fires whenever the user has modified the data of the control. The change event fires when the value is committed.
           * https://html.spec.whatwg.org/multipage/input.html#common-input-element-events
           */
          onChange={(e) => {
            // user selected a file
            if (e.target.files && e.target.files[0]) {
              // pull the file object (Type File) out of the FileList in .files
              // https://developer.mozilla.org/en-US/docs/Web/API/File
              const file = e.target.files[0];
              // then create an objectURL so the file can be previewed
              // https://developer.mozilla.org/de/docs/Web/API/URL/createObjectURL
              // do not use file here because it will not get updated before the function call (useState values are constant within 1 render cycle)
              const objectURL = URL.createObjectURL(e.target.files[0]);

              setFileWithObjectURL({
                file,
                objectURL,
              });
            } else {
              // user pressed cancel and did not select a file

              if (fileWithObjectURL) {
                // the previously created object url should be revoked to free memory
                // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
                URL.revokeObjectURL(fileWithObjectURL.objectURL);
              }

              setFileWithObjectURL(undefined);
            }
          }}
          type="file"
          accept="image/*"
        />
        <button
          disabled={fileWithObjectURL ? false : true}
          type="button"
          onClick={() => {
            // this check is necessary because the tsc doesnt recognize that the event only gets fired when fileWithObjectURL is not undefined 🙃
            if (fileWithObjectURL) {
              const formData = new FormData();
              // "image" is the key under which you will find the file on the server side
              // optionally you can overwrite the fileName on appends third argument
              formData.append("image", fileWithObjectURL.file);
              axios.post("<INSERT_YOUR_BACKEND_URL>", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
            }
          }}
        >
          SUBMIT FORM
        </button>
      </form>
    </div>
  );
}

export default App;
