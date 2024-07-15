import { createTestUrlFileSource } from "./lib/protocol/urlTransfer";
import { Agent, request } from 'node:https';
import Client from './lib/client';

async function main() {

    const httpsAgent = new Agent({ keepAlive: true, maxSockets: 100 });
    const objectStorageSourceInterface = await createTestUrlFileSource({
        get(url: string, options: { headers: Record<string, string> }) {
            console.log('making get request');
            return request(url, {
                method: 'GET',
                headers: options.headers,
                agent: httpsAgent
            });
        }, 
        put(url: string, options: { headers: Record<string, string> }) {
            throw new Error('Not implemented');
        }
    }, 'https://raw.githubusercontent.com/minimaxir/big-list-of-naughty-strings/master/blns.txt',
    );

    const conn = new Client();

    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.sftp((err: Error, sftp: any) => {
          if (err) throw err;

          sftp.fastPutSled(objectStorageSourceInterface, 'file-small.txt', 'file-small.txt', (err: Error) => {
            if (err) throw err;
            console.log('File transferred');
            sftp.fastGet('file-small.txt', 'file-small.txt', (err: Error) => {
                if (err) throw err;
                console.log('File fetched');
                conn.end();
            });
          });

        });
      }).connect({
        host: 'eu-west-1.sftpcloud.io',
        username: 'test-sftp',
        port: 22,
        password: 'ejbxw4sPo1JQqYmvUQlROpeqFH6gwCb7'
      });

    // fastXfer(objectStorageSourceInterface, dst, 'dummy-path', dstPath, { concurrency: 64 }, (err) => {
    //     if (err) {
    //       console.error('Transfer failed:', err);
    //     } else {
    //       console.log('Transfer completed successfully');
    //     }
    //   });
}

main();