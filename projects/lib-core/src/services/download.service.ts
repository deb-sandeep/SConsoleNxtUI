import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DownloadService {
    constructor(private http: HttpClient) {}

    async postForDownload( url: string, body: any, opts?: {
        headers?: HttpHeaders | {[k: string]: string};
        params?: {[k: string]: string | number | boolean};
        filenameFallback?: string;
        withCredentials?: boolean;
    }): Promise<void> {

        const res = await firstValueFrom(this.http.post(url, body, {
            responseType: 'blob',
            observe: 'response',
            headers: opts?.headers,
            params: opts?.params as any,
            withCredentials: !!opts?.withCredentials
        })) as HttpResponse<Blob> ;

        const cd = res.headers.get('Content-Disposition') ?? '';
        const name = this.parseFilename(cd) || opts?.filenameFallback || 'download';
        const blobUrl = URL.createObjectURL(res.body!);
        const a = document.createElement('a');

        a.href = blobUrl;
        a.download = name;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
    }

    private parseFilename(cd: string): string | null {
        const m1 = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(cd);
        if (m1) return decodeURIComponent(m1[1].replace(/(^"|"$)/g, ''));
        const m2 = /filename="?([^"]+)"?/i.exec(cd);
        return m2 ? m2[1] : null;
    }
}
