"use client";

import UserContext, { UserData } from "@/contexts/UserContext";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { toast } from "react-toastify";

type Video = {
  url: string;
  title: string;
  description: string;
  id: number;
};

interface ErrorResponse {
  error: {
    [key: string]: string;
  };
}

async function shareVideo({
  url,
  title,
  description,
  accessToken,
}: {
  url: string;
  title: string;
  description: string;
  accessToken: string;
}): Promise<Video> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(apiUrl + "/v1/videos", {
    method: "POST",
    body: JSON.stringify({ url, title, description }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.log("error", response);
    const error = (await response.json()) as ErrorResponse;
    const errorMessage = error.error.message;
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }
  console.log("created", response);

  const data = await response.json();

  const video: Video = {
    id: data.video.id,
    url: data.video.url,
    title: data.video.title,
    description: data.video.description,
  };

  console.log("video", video);
  return video;
}

export default function Share() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  let userData = user as unknown as UserData;

  const mutation = useMutation({
    mutationFn: shareVideo,
  });

  if (!userData) {
    setTimeout(() => {
      router.push("/login");
    }, 1);
  }

  const isYouTubeUrlValid = (url: string) => {
    const pattern =
      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?=.*v=\w+)(?:\S+)?$/;
    return pattern.test(url);
  };

  const getYouTubeVideoId = (url: string) => {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    } else {
      const queryParams = new URLSearchParams(urlObj.search);
      return queryParams.get("v");
    }
  };

  const isYoutubeVideoWatchable = async (videoUrl: string) => {
    if (isYouTubeUrlValid(videoUrl)) {
      const videoId = getYouTubeVideoId(videoUrl);
      if (videoId) {
        try {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
          );
          const data = await response.json();
          if (data.items.length === 0) {
            console.error("Video not found.");
            toast.error("Video not found.");
            return false;
          }
          return true;
        } catch (error) {
          console.error("Error checking video status:", error);
        }
      } else {
        console.error("Invalid video ID.");
        toast.error("Invalid YouTube URL format.");
        return false;
      }
    } else {
      console.log("Invalid YouTube URL format.");
      toast.error("Invalid YouTube URL format.");
      return false;
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const url = data.get("youtube-link") as string;
    if (!(await isYoutubeVideoWatchable(url))) {
      return;
    }
    const title = data.get("video-title") as string;
    if (!title) {
      toast.error("Video title is required");
      return;
    }
    const description = data.get("video-description") as string;
    const accessToken = userData.accessToken;
    mutation.mutate({ url, title, description, accessToken });
  };

  if (mutation.isSuccess) {
    console.log(mutation.data);
    const video = mutation.data;
    router.push(`/videos`);
  }

  if (mutation.isError) {
    console.log(mutation.error);
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Share Video
          </h2>
          <form onSubmit={onSubmit}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="col-span-full">
                    <label
                      htmlFor="youtube-link"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Youtube Link
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="youtube-link"
                        id="youtube-link"
                        autoComplete="youtube-link"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div className="col-span-full">
                    <label
                      htmlFor="video-title"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Title
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="video-title"
                        id="video-title"
                        autoComplete="video-title"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div className="col-span-full">
                    <label
                      htmlFor="video-description"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Description (Optional)
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="video-description"
                        name="video-description"
                        rows={3}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        defaultValue={""}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <Link href="/videos">
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
