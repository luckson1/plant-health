"use client";

import { ChatList } from "@/components/chat_list";
import { ChatScrollAnchor } from "@/components/chat_scorll_anchor";
import { ImageDropzone } from "@/components/dropzone";
import { Button } from "@/components/ui/button";
import { IconArrowElbow, IconRefresh, IconStop } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useChat } from "ai/react";
import { useRef, useState } from "react";
import { client } from "@gradio/client";
import LoadingSVG from "@/components/loading_svg";
import { Plants } from "@/components/plants_covered";
import { nanoid } from "@/lib/utils";
import { EmptyScreen } from "@/components/emptyscreen";
import { ButtonScrollToBottom } from "@/components/button_scroll_to_bottom";
type Result = {
  data: {
    label: string;
    confidences: {
      label: string;
      confidence: number;
    }[];
  }[];
};

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const [images, setImages] = useState<File[] | null>(null);
  const [imagePrediction, setImagePrediction] = useState<string>();
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [percentageConfidence, setPercentageConfidence] = useState<number>();
  const isHealthyLeaf = imagePrediction
    ? imagePrediction.includes("healthy")
    : false;
  const healthyPlantName = imagePrediction
    ? imagePrediction.replace(new RegExp("\\b" + "healthy" + "\\b", "gi"), "")
    : "";
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    setInput,
    reload,
  } = useChat();

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef?.current?.requestSubmit();
      event.preventDefault();
    }
  };
  const uploadToS3Bucket = async () => {
    if (!images) {
      return null;
    }

    const { data }: { data: { uploadUrl: string; key: string } } =
      await axios.get(`/api/upload`);

    const { uploadUrl, key } = data;

    await axios.put(uploadUrl, images[0]);

    return key;
  };

  const getPrediction = async () => {
    try {
      setImagePrediction(undefined);
      setIsPredictionLoading(true);
      const Key = await uploadToS3Bucket();
      if (!Key) return;
      const response: { data: { imageUrl: string } } = await axios.post(
        `/api/predict`,
        { Key }
      );
      const url = response.data.imageUrl;
      const response_0 = await fetch(url);
      const exampleImage = await response_0.blob();

      const app = await client("https://jacksonga-plant-disease.hf.space/");

      const result = (await app.predict("/predict", [exampleImage])) as Result;

      const prediction = result.data[0].label;
      const confidence = result?.data?.at(0)?.confidences?.at(0)?.confidence;

      if (prediction && confidence) {
        setImagePrediction(prediction);
        setIsPredictionLoading(false);
        setPercentageConfidence(Math.round(confidence * 100));
        const isSickLeaf = !prediction.includes("healthy");
        const id = nanoid();
        if (isSickLeaf)
          append({
            content: `What is ${prediction}, its symptoms, prevention and treatment measures`,
            id,
            role: "user",
          });
      }
      setIsPredictionLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsPredictionLoading(false);
    }
  };

  return (
    <main className="w-full h-full flex flex-col text-center px-4 mt-4 sm:mb-0 mb-8 py-10 lg:px-10 justify-center items-center">
      <div className="flex flex-1 w-full flex-col lg:flex-row  text-center  gap-x-5 xl:gap-x-0 space-y-10 xl:space-y-0 ">
        <div className="w-full flex-col space-y-5 max-w-xs mx-auto">
          <ImageDropzone
            setImages={setImages}
            images={images}
            setImagePrediction={setImagePrediction}
          />
          <Button
            className="w-full"
            size={"lg"}
            onClick={async () => await getPrediction()}
            disabled={!images}
          >
            {isPredictionLoading ? (
              <div className="flex flex-row space-x-3">
                <LoadingSVG />
                Loading
              </div>
            ) : (
              "Determine leaf condition"
            )}
          </Button>
          {imagePrediction && (
            <p className="text-start">
              {isHealthyLeaf
                ? `There's ${
                    percentageConfidence ?? "high "
                  }% chance this is a healthy ${healthyPlantName} leaf`
                : `There's ${
                    percentageConfidence ?? "high "
                  }% chance this leaf has ${imagePrediction}.`}
            </p>
          )}
        </div>

        <div className="flex flex-col w-full max-w-2xl  mx-auto stretch">
          <>
            {messages.length ? (
              <>
                {" "}
                <ChatList messages={messages} />
                <ChatScrollAnchor trackVisibility={isLoading} />{" "}
              </>
            ) : (
              <EmptyScreen setInput={setInput} />
            )}

            <div className="w-full">
              <ButtonScrollToBottom />
              <div className="mx-auto sm:max-w-2xl sm:px-4">
                <div className="flex h-10 items-center justify-center">
                  {isLoading ? (
                    <Button
                      variant="outline"
                      onClick={() => stop()}
                      className="bg-background"
                    >
                      <IconStop className="mr-2" />
                      Stop generating
                    </Button>
                  ) : (
                    messages?.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => reload()}
                        className="bg-background"
                      >
                        <IconRefresh className="mr-2" />
                        Regenerate response
                      </Button>
                    )
                  )}
                </div>
                <form
                  onSubmit={handleSubmit}
                  ref={formRef}
                  className="relative "
                >
                  <Textarea
                    onKeyDown={handleKeyDown}
                    className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                    value={input}
                    placeholder={
                      isHealthyLeaf || !imagePrediction
                        ? "Ask me about any plant disease..."
                        : `Ask me about ${imagePrediction}`
                    }
                    onChange={handleInputChange}
                  />
                  <div className="absolute right-0 top-4 sm:right-4">
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || input === ""}
                    >
                      <IconArrowElbow />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </>
        </div>
      </div>
    </main>
  );
}
