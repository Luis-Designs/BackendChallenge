import { IVideo } from "../data/models/Video.models";

export interface AxiosVideResponse {
    status: number;
    documents: IVideo[]
}

export interface TikTokListingData {
    data: {
        children: TikTokVideoData[]
    }
}

export interface TikTokVideoData {
    data: {
        url_overridden_by_dest: string,
        secure_media: {
            reddit_video: {
                duration: number
            }
        }
    }
}