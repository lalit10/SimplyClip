/*
MIT License

Copyright (c) 2021 lalit10

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

let _clipboardList = document.querySelector("#clipboard_list");
let addButton = document.getElementById('add-btn');
addButton.addEventListener('click', (event) => {
    let textitem = ''
    let emptyDiv = document.getElementById('empty-div');
    let downloadDiv = document.getElementById('download-btn');
    let searchInput = document.getElementById('searchText');
    emptyDiv.classList.add('hide-div');
    downloadDiv.style.display = 'block';
    document.getElementsByClassName('doc')[0].addEventListener('click', (event) => {
        downloadClipboardTextAsDoc()
    })
    document.getElementsByClassName('csv')[0].addEventListener('click', (event) => {
        downloadClipboardTextAsCsv()
    })
    searchInput.style.display = 'block';
    searchInput.addEventListener('keyup', () => {
        searchClipboardText();
    })
    addClipboardListItem(textitem)
})
function getClipboardText() {
    chrome.storage.sync.get(['list'], clipboard => {
        let list = clipboard.list;
        let emptyDiv = document.getElementById('empty-div');
        let downloadDiv = document.getElementById('download-btn');
        let searchInput = document.getElementById('searchText');
        if (list === undefined || list.length === 0) {
            emptyDiv.classList.remove('hide-div');
            downloadDiv.style.display = 'none';
            searchInput.style.display = 'none';
        }
        else {
            emptyDiv.classList.add('hide-div');
            downloadDiv.style.display = 'block';
            document.getElementsByClassName('doc')[0].addEventListener('click', (event) => {
                downloadClipboardTextAsDoc()
            })
            document.getElementsByClassName('csv')[0].addEventListener('click', (event) => {
                downloadClipboardTextAsCsv()
            })
            searchInput.style.display = 'block';
            searchInput.addEventListener('keyup', () => {
                searchClipboardText();
            })
            if (typeof list !== undefined)
                list.forEach(item => {
                    addClipboardListItem(item)
                });
        }
    });
}

function getThumbnail(textContent) {
    let ind = textContent.indexOf('https://www.youtube.com/');
    if (ind === 0) {
        let videoId = "";
        let idIndex = textContent.indexOf('watch?v=');
        let endIndex = textContent.indexOf('&');
        if (endIndex !== -1)
            videoId = textContent.substring(idIndex + 8, endIndex);
        else
            videoId = textContent.substring(idIndex + 8, textContent.length);
        let url = `https://img.youtube.com/vi/${videoId}/1.jpg`;
        return {
            sourceUrl: textContent,
            imageUrl: url,
            isVideo: true,
        };
    }
    else {
        let ind = textContent.indexOf('http');
        if (ind === 0) {
            let url = new URL(textContent);
            let ans = "https://favicons.githubusercontent.com/" + url.hostname;
            return {
                sourceUrl: textContent,
                imageUrl: ans,
                isVideo: false
            }
        }
    }
    return {
        sourceUrl: "",
        imageUrl: ""
    }
        ;
}
function addClipboardListItem(text) {
    let { sourceUrl, imageUrl, isVideo } = getThumbnail(text);
    let listItem = document.createElement("li"),
        listDiv = document.createElement("div"),
        deleteDiv = document.createElement("div"),
        editDiv = document.createElement("div"),
        contentDiv = document.createElement("div"),
        editImage = document.createElement("img");
    editImage.setAttribute("data-toggle", "tooltip");
    editImage.setAttribute("data-placement", "bottom");
    editImage.setAttribute("title", "Click to edit the text entry!");
    let deleteImage = document.createElement("img");
    deleteImage.setAttribute("data-toggle", "tooltip");
    deleteImage.setAttribute("data-placement", "bottom");
    deleteImage.setAttribute("title", "Click to delete the text entry!");
    let listPara = document.createElement("p");
    let listText = document.createTextNode(text);
    listPara.setAttribute("data-toggle", "tooltip");
    listPara.setAttribute("data-placement", "bottom");
    listPara.setAttribute("title", "Click to copy the below text:\n" + text);
    let popupLink = document.createElement('a');
    let imagePopup = document.createElement('img');
    prevText = text;

    if (imageUrl.length > 0) {
        console.log("IMage Url found")
        imagePopup.src = imageUrl;
        if (!isVideo) {
            imagePopup.style.width = '32px'
            imagePopup.style.height = '32px';

        }
        else {
            imagePopup.style['margin-left'] = '0px';
            imagePopup.style['margin-top'] = '0px';
            listPara.style['max-width'] = '12rem'
        }
        popupLink.href = sourceUrl;
        popupLink.target = '_blank';
        popupLink.appendChild(imagePopup);
        listDiv.appendChild(popupLink);

    }

    listPara.appendChild(listText)
    listDiv.appendChild(listPara);
    listPara.addEventListener('focusout', (event) => {
        event.target.setAttribute("contenteditable", "false");
        listPara.style.height = '4em';
        listPara.style.whiteSpace = 'inherit'
        newText = event.target.textContent;
        chrome.storage.sync.get(['list'], clipboard => {
            let list = clipboard.list;
            let index = list.indexOf(prevText);
            list[index] = newText;
            chrome.storage.sync.set({ 'list': list }, () => { console.log("Text updated"); });
        })
    })
    listDiv.classList.add("list-div");
    contentDiv.appendChild(listDiv);
    editImage.src = './images/pencil.png';
    editImage.classList.add("edit");
    deleteImage.src = './images/delete-note.png';
    // deleteImage.src = 'https://cdn.iconscout.com/icon/premium/png-256-thumb/delete-1432400-1211078.png'
    deleteImage.classList.add("delete")

    editDiv.appendChild(editImage);
    contentDiv.appendChild(editDiv);
    deleteDiv.appendChild(deleteImage);
    contentDiv.appendChild(deleteDiv);
    contentDiv.classList.add("content");
    listItem.appendChild(contentDiv);

    _clipboardList.appendChild(listItem);
    editImage.addEventListener('click', (event) => {
        console.log("Edit button clicked");
        prevText = listPara.textContent;
        console.log(prevText);
        listPara.setAttribute("contenteditable", "true");
        
        listPara.style.height = 'auto';
        listPara.style.whiteSpace = 'break-spaces';
        listPara.focus();
        // listDiv.style.borderColor = "red";
        // listPara.style.backgroundColor = "grey"
        // listPara.style.height = "100px"
        //listPara.focus();
    })
    deleteImage.addEventListener('click', (event) => {
        console.log("Delete clicked");
        chrome.storage.sync.get(['list'], clipboard => {
            let list = clipboard.list;
            let index = list.indexOf(text);
            list.splice(index, 1);
            _clipboardList.innerHTML = "";
            chrome.storage.sync.get(['listURL'], url => {
                let urlList = url.listURL;
                urlList.splice(index, 1);
                chrome.storage.sync.set({ 'listURL': urlList })
            })
            chrome.storage.sync.get(['originalList'], original => {
                let originalList = original.originalList;
                originalList.splice(index, 1);
                chrome.storage.sync.set({ 'originalList': originalList })
            })
            chrome.storage.sync.set({ 'list': list }, () => getClipboardText());
        })
    })

    listDiv.addEventListener('click', (event) => {
        let { textContent } = event.target;
        navigator.clipboard.writeText(textContent)
            .then(() => {
                console.log(`Text saved to clipboard`);
                chrome.storage.sync.get(['list'], clipboard => {
                    let list = clipboard.list;
                    let index = list.indexOf(textContent);
                    if (index !== -1)
                        list.splice(index, 1);

                    list.unshift(textContent);
                    _clipboardList.innerHTML = "";
                    chrome.storage.sync.set({ 'list': list }, () => getClipboardText());
                });
            });
        let x = document.getElementById("snackbar");
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    });
}


function downloadClipboardTextAsDoc(){
    chrome.storage.sync.get(['list'], clipboard => {
        let list = clipboard.list;
        let emptyDiv = document.getElementById('empty-div');
        if (list === undefined || list.length === 0) {
            emptyDiv.classList.remove('hide-div');
            console.log("Nothing to download")
        }
        else {
            var list_of_items = []
            emptyDiv.classList.add('hide-div');
            if (typeof list !== undefined){
                list.forEach(item => {
                    list_of_items = list_of_items + item + "\n\n"
                });
                var link, blob, url;
                blob = new Blob(['\ufeff', list_of_items], {
                    type: 'application/msword'
                });
                url = URL.createObjectURL(blob);
                link = document.createElement('A');
                link.href = url;
                link.download = 'SimplyClip';  
                document.body.appendChild(link);
                if (navigator.msSaveOrOpenBlob )
                    navigator.msSaveOrOpenBlob( blob, 'SimplyClip.doc'); 
                else link.click();  // other browsers
                document.body.removeChild(link);
            }

        }
    });

}

function searchClipboardText() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchText");
    filter = input.value.toUpperCase();
    ul = document.getElementById("clipboard_list");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        divElement = li[i].getElementsByClassName("list-div")[0];
        let elementText = divElement.getElementsByTagName('p')[0]
        txtValue = elementText.textContent || elementText.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}
getClipboardText();

  
function downloadClipboardTextAsCsv() {
    let data = [];
    chrome.storage.sync.get(['list'], clipboard => {
        clipboardData = clipboard.list
        chrome.storage.sync.get(['listURL'], url => {
            urlData = url.listURL
            chrome.storage.sync.get(['originalList'], original => {
                originalData = original.originalList
                clipboardData.forEach((d, index) => {
                    let rowData = [];
                    rowData.push(d)
                    rowData.push(originalData[index])
                    rowData.push(urlData[index])
                    data.push(rowData)
                })

                var csv = 'Edited Text,OriginalText,URL\n';
                data.forEach(function (row) {
                    for (let i in row) {
                        row[i] = row[i].replace(/"/g, '""');
                    }
                    
                    csv += '"' + row.join('","') + '"';
                    csv += "\n";
                });

                var hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
                hiddenElement.target = '_blank';
                hiddenElement.download = 'simplyClip.csv';
                hiddenElement.click();
            })
        })
    })




}