import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface Video {
  id: number;
  title: string;
  url: string;
  description: string;
  thumbnail: string;
  created_at: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
}
async function fetchVideos(): Promise<Video[]> {
  const response = await fetch("http://localhost:4000/v1/videos");
  if (!response.ok) {
    throw new Error("Failed on get videos request");
  }
  const data = await response.json();
  let videos = data.videos;
  videos = videos.map((v: any) => {
    const url = v.url;
    const videoId = url.split("v=")[1];
    const thumbnailUrl = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";

    return {
      ...v,
      thumbnail: thumbnailUrl,
    };
  });
  return videos;
}
const Videos = () => {
  const {
    isLoading,
    data: videos,
    isError,
    error,
  } = useQuery<Video[], Error>({ queryKey: ["videos"], queryFn: fetchVideos });
  console.log("videos", videos);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Fun Videos
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Enjoy the funniest videos on the internet.
          </p>
          <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
            {videos &&
              videos.map((video) => (
                <article
                  key={video.id}
                  className="relative isolate flex flex-col gap-8 lg:flex-row"
                >
                  <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-x-4 text-xs">
                      <time
                        dateTime={video.created_at}
                        className="text-gray-500"
                      >
                        {video.created_at}
                      </time>
                    </div>
                    <div className="group relative max-w-xl">
                      <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                        <a href={video.url}>
                          <span className="absolute inset-0" />
                          {video.title}
                        </a>
                      </h3>
                      <p className="mt-5 text-sm leading-6 text-gray-600">
                        {video.description}
                      </p>
                    </div>
                    <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                      <div className="relative flex items-center gap-x-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 text-lg font-bold">
                            {video.author.name[0]}
                          </span>
                        </div>
                        <div className="text-sm leading-6">
                          <p className="font-semibold text-gray-900">
                            <a href="#">
                              <span className="absolute inset-0" />
                              {video.author.name}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;
