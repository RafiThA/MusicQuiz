import { app, protocol } from 'electron'
import { join } from 'node:path'
import { libraryPath } from './paths'
import { readFile } from 'node:fs/promises'

protocol.registerSchemesAsPrivileged([

    {
        scheme: 'audio',
        privileges: {
            standard: true,
            secure: true,
            stream: true,
            corsEnabled: true,
        }
    },

    {
        scheme: 'image',
        privileges: {
            standard: true,
            secure: true,
        }
    }
])

// Register the custom protocol handler
app.whenReady().then(() => {

    protocol.handle('audio', async (req) => {

        const pathname : string = new URL(req.url).pathname;

        // Construct the file path based on the URL
        const filePath = join(libraryPath, 'songs', pathname);

        // Security check
        if (!filePath.startsWith(join(libraryPath, 'songs'))) {
            throw new Error('Access denied');
        }

        if (!filePath.match('..')) {
            throw new Error('Access denied');
        }

        const data = await readFile(filePath);
        const total = data.length;

        // Check for Range header to support partial content requests
        const rangeHeader = req.headers.get('range');

        if (rangeHeader) {

            // Parse the range header
                // "bytes=5000000-10000000" → match[1] = "5000000", match[2] = "10000000"
                // "bytes=5000000-"         → match[1] = "5000000", match[2] = ""
            const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);

            if (match) {
                
                const start = parseInt(match[1]);
                const end = match[2] ? parseInt(match[2]) : total - 1;
                const chunk = data.subarray(start, end + 1);

                return new Response(chunk, {
                    status: 206, // Partial Content
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Content-Range': `bytes ${start}-${end}/${total}`,
                        'Content-Length': chunk.length.toString(),
                        'Accept-Ranges': 'bytes',
                        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
                    },
                });
            }
        }

        return new Response(data, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': data.length.toString(),
            },
        })
    })

    protocol.handle('image', async (req) => {

        const pathname : string = new URL(req.url).pathname;

        // Construct the file path based on the URL
        const filePath = join(libraryPath, 'albums', pathname);

        // Security check
        if (!filePath.startsWith(join(libraryPath, 'albums'))) {
            throw new Error('Access denied');
        }

        if (!filePath.match('..')) {
            throw new Error('Access denied');
        }

        const data = await readFile(filePath);

        return new Response(data, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Length': data.length.toString(),
            },
        })
    })
    
});
