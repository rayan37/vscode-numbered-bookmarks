"use strict";

import * as vscode from "vscode";
import fs = require("fs");

export const MAX_BOOKMARKS = 10;
export const NO_BOOKMARK_DEFINED = -1;

export class Bookmark {
        fsPath: string;
        bookmarks: number[]; 

        constructor(fsPath: string) {
            this.fsPath = fsPath;
            this.bookmarks = [];
            this.bookmarks.length = MAX_BOOKMARKS;
            this.resetBookmarks();
        }

        public resetBookmarks() {
            for (var index = 0; index < MAX_BOOKMARKS; index++) {
                this.bookmarks[index] = NO_BOOKMARK_DEFINED;
            }
        }
        
        public listBookmarks() {
            
            return new Promise((resolve, reject) => {
                
                if (this.bookmarks.length == 0) {
                    resolve({});
                    return;
                }
                
                if (!fs.existsSync(this.fsPath)) {
                    resolve({});
                    return;
                }
                
                let uriDocBookmark: vscode.Uri = vscode.Uri.file(this.fsPath);
                vscode.workspace.openTextDocument(uriDocBookmark).then(doc => {    
                    
                    let items = [];
                    let invalids = [];
                    for (var index = 0; index < this.bookmarks.length; index++) {
                        var element = this.bookmarks[index];
                        // fix for modified files
                        if (element != NO_BOOKMARK_DEFINED) {
                        //if ((element != NO_BOOKMARK_DEFINED) && (element <= doc.lineCount)) {
                            if (element <= doc.lineCount) {
                                let lineText = doc.lineAt(element).text;
                                let normalizedPath = doc.uri.fsPath;
                                element++;
                                items.push({
                                    label: element.toString(),
                                    description: lineText,
                                    detail: normalizedPath
                                });  
                            } else {
                                invalids.push(element);
                            }
                        }
                    }

                    if (invalids.length > 0) {                
                        for (let indexI = 0; indexI < invalids.length; indexI++) {
                            this.bookmarks[invalids[indexI]] = NO_BOOKMARK_DEFINED;
                        }
                    }
                    
                    resolve(items);
                    return;
                });
            })
        }        
    }
