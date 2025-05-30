/*import {check} from "@tauri-apps/plugin-updater";
import {relaunch} from "@tauri-apps/plugin-process";

export async function updaterManager() {  // Soon
    const update = await check();
    if (!update) return;

    console.log(`New version found: ${update.version}.`);

    let downloaded = 0;
    let contentLength: number | undefined = 0;

    await update.downloadAndInstall((event) => {
        switch (event.event) {
            case 'Started':
                contentLength = event.data.contentLength;
                console.log(`Started downloading ${event.data.contentLength} bytes`);
                break;

            case 'Progress':
                downloaded += event.data.chunkLength;
                console.log(`Downloaded ${downloaded} from ${contentLength}`);
                break;

            case 'Finished':
                console.log('Download finished');
                break;
        }
    });

    console.log('Update installed');
    await relaunch();
}*/
