import * as vscode from 'vscode';
import * as https from 'https';
import axios from 'axios';

import { IGiteaResponse } from './IGiteaResponse';
import { Logger } from './logger';
import { Config } from './config';

export class GiteaConnector {
    private authToken: string;
    private ssl: boolean;

    public constructor(authToken: string, ssl: boolean = false) {
        this.authToken = authToken;
        this.ssl = ssl;
    }

    public async getIssues(repoUri: string, state: string, page: number = 0): Promise<IGiteaResponse> {
        console.log((`${repoUri}?state=${state}&page=${page}`))
        return this.getEndpoint(`${repoUri}?state=${state}&page=${page}`);
    }

    private get requestOptions(): object {
        const agent = new https.Agent({
            rejectUnauthorized: this.ssl,
        });
        return {
            headers: {
                // Authorization: 'token ' + this.authToken,
                Authorization: 'token b9c837c0853d28fcde62700ecb85a49036577fa5',
                Accept: 'application/json;charset=utf-8'
            },
            // httpsAgent: agent,
        };
    }

    // Using AXIOS
    // private async getEndpoint(url: string): Promise<IGiteaResponse> {
    //     Logger.debug('getEndpoint', 'request', {'url': url})
    //     return new Promise<IGiteaResponse>((resolve, reject) => {
    //         return axios.get(url, this.requestOptions).then((data) => {
    //             resolve(data);
    //             Logger.debug('getEndpoint', 'response', {'url': url, 'status': data.status, 'size': data.data.length})
    //         }).catch((err) => {
    //             this.displayErrorMessage(err);
    //             Logger.log(err)
    //             reject(err);
    //         });
    //     });
    // }

    /// Using https
    private async getEndpoint(endPointPath: string): Promise<IGiteaResponse> {

        const config = new Config();
        Logger.debug('getEndpoint', 'request', { 'url': endPointPath });

        return new Promise<IGiteaResponse>(async (resolve, reject) => {

            const requestOptions = {
                method: 'GET',
                hostname: config.host,
                port: config.port,
                path: '/api/v1/repos/' + config.owner +'/'+ config.repo +'/issues', // endPointPath,
                
                rejectUnauthorized: this.ssl,
                headers: {
                    // Authorization: 'token ' + this.authToken,
                    Authorization: 'token b9c837c0853d28fcde62700ecb85a49036577fa5',
                    Accept: 'application/json;charset=utf-8'
                },
            };
            const req = https.request(requestOptions, (res) => {
                var responseData: any;
                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    
                    Logger.debug('getEndpoint', 'response', { 'url': endPointPath, 'status': res.statusCode });
                    resolve(responseData);
                    console.log('responseData:' + responseData);
                });
            }).on('error', (err) => {
                this.displayErrorMessage(err.message);
                Logger.log(err.message);
                reject(err);
            });

            req.end();
        });
    }

    private async postEndpoint(url: string): Promise<IGiteaResponse> {
        return new Promise<IGiteaResponse>((resolve, reject) => {
            // return axios.post(url, this.requestOptions);
        });
    }



    private displayErrorMessage(err: string) {
        vscode.window.showErrorMessage("Error occoured. " + err);
    }
}
