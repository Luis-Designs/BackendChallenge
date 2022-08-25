import axios from 'axios'
import queryString from 'query-string'
import { AxiosVideResponse, TikTokListingData } from '../types/tiktokService'

const { VIDEOS_API, TOKEN_VIDEOS } = process.env

class AxiosService {
    async getVideos(limit: number): Promise<AxiosVideResponse> {

        const url = queryString.stringifyUrl({
            url: VIDEOS_API || '',
            query: {
                limit
            }
        })

        const { data, status }: { data: TikTokListingData, status: number } = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${TOKEN_VIDEOS}`
            }
        })

        const documents = data?.data?.children?.map(child => (
            {
                url: child.data.url_overridden_by_dest,
                duration: child.data.secure_media.reddit_video.duration
            }
        ))

        return { documents, status }
    }

    async downloadVideo(baseUrl: string, quality = 220) {
        const { data } = await axios.get(`${baseUrl}/DASH_${quality}.mp4`, { responseType: 'stream' })
        return data
    }

    async downloadAudio(baseUrl: string) {
        const { data } = await axios.get(`${baseUrl}/DASH_audio.mp4`, { responseType: 'stream' })
        return data
    }
}

export default new AxiosService