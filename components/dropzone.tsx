import { useDropzone } from "react-dropzone";
import ToolTipComponent from "./tooltip_component";
import { Button } from "./ui/button";
import { IconTrash } from "./ui/icons";
import { UploadCloud } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
export interface MediaData extends Blob {
  name: string;
}

export const ImageDropzone = ({
  images,
  setImages,
  setImagePrediction
}: {
  images: File[] | null;
  setImages: Dispatch<SetStateAction<File[] | null>>;
  setImagePrediction: Dispatch<SetStateAction<string | undefined>>
}) => {
  const [files, setFiles] = useState<(MediaData & { preview: string })[]>([]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      setImages(acceptedFiles);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <div
      className=" mb-2 mr-2 inline-flex h-full w-full rounded-[0.5rem]  p-1"
      key={file.name}
    >
      <div className="relative flex h-full w-full overflow-hidden">
        <Image
          alt="room"
          src={file.preview}
          className="block h-full w-auto rounded-[0.5rem]"
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
          fill
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revokex the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);
  return (
    <section className=" item-center border-border  border-dashed   flex h-[20rem]  w-full max-w-xs flex-col rounded-[0.5rem] border-2  px-2 py-4">
      {files.length <= 0 && (
        <div
          {...getRootProps({ className: "dropzone" })}
          className="cursor-pointer h-full"
        >
          <label htmlFor="upload" className="w-full h-full cursor-pointer">
            <input {...getInputProps()} />
            <div
              className="flex w-full h-full flex-row items-center justify-center gap-3 align-baseline"
              id="upload"
            >
              {!images && (
                <>
                  {isDragActive ? (
                    <p className="text-green-500">Drop them here!</p>
                  ) : (
                    <div className="flex space-x-2">
                      {" "}
                      <UploadCloud className="text-sm" />{" "}
                      <p>Click to select or drag and drop an image</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </label>
        </div>
      )}
      {files.length > 0 && (
        <aside className="relative  flex flex-col  h-full w-full justify-center items-center">
                {images && (
            <ToolTipComponent content="Change image">
            <IconTrash
                className="h-8 w-8 cursor-pointer text-destructive"
                onClick={() => {setImages(null); setFiles([]);  setImagePrediction(undefined)} }

            />
            </ToolTipComponent>
        )}
        <div className="flex h-full w-full flex-row flex-wrap">
        {thumbs}
        </div>
       
        </aside>
      )}
    </section>
  );
};
