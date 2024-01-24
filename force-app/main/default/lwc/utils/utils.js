export function exportCSVFile(headers, totalData, fileTitle){
    if(!totalData || !totalData.length){
        return null
    }
    const jsonObject = JSON.stringify(totalData)
    const result = convertToCSV(jsonObject, headers)
    if(result === null) return
    const blob = new Blob([result])
    const exportedFilename = fileTitle ? fileTitle+'.csv' :'export.csv'
    if(navigator.msSaveBlob){
        navigator.msSaveBlob(blob, exportedFilename)
    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)){
        const link = window.document.createElement('a')
        link.href='data:text/csv;charset=utf-8,' + encodeURI(result);
        link.target="_blank"
        link.download=exportedFilename
        link.click()
    } else {
        const link = document.createElement("a")
        if(link.download !== undefined){
            const url = URL.createObjectURL(blob)
            link.setAttribute("href", url)
            link.setAttribute("download", exportedFilename)
            link.style.visibility='hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }
    

}
function convertToCSV(objArray, headers){
    const columnDelimiter = ','
    const lineDelimiter = '\r\n'
    const actualHeaderKey = Object.keys(headers)
    const headerToShow = Object.values(headers) 
    let str = ''
    str+=headerToShow.join(columnDelimiter) 
    str+=lineDelimiter
    const data = typeof objArray !=='object' ? JSON.parse(objArray):objArray

    data.forEach(obj=>{
        let line = ''
        actualHeaderKey.forEach(key=>{
            if(line !=''){
                line+=columnDelimiter
            }
            let strItem = obj[key]+''
            line+=strItem? strItem.replace(/,/g, ''):strItem
        })
        str+=line+lineDelimiter
    })
    console.log("str", str)
    return str
}
/**
 * BSD 3-Clause License
 *
 * Copyright (c) 2021, Avonni Labs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
export const classnames = (...args) =>
args
  .filter(arg => !!arg)
  .flatMap(arg => {
    const type = typeof arg;

    if (type === 'string' || type === 'number') {
      return arg;
    } else if (Array.isArray(arg)) {
      return classnames(...arg);
    } else if (type === 'object') {
      return Object.entries(arg)
        .filter(([_, isEnabled]) => isEnabled)
        .map(([className]) => className);
    }

    return [];
  })
  .join(' ');

export const groupBy = (grouper, array) =>
array.reduce((grouped, item) => {
  const key = grouper(item);
  return {
    ...grouped,
    [key]: (grouped[key] || []).concat(item),
  };
}, {});


export const compareNumbers = (a, b) => (a || 0) - (b || 0);
export const compareDates = (a,b) =>
(a ? new Date(a) : new Date()) - (b ? new Date(b) : new Date());
export const compareStrings = (a, b) => (a || '').localeCompare(b || '');
export const defaultSort = compareStrings;

export const dataTableSorter = columnDefinitions => {
const columnSorters = columnDefinitions.reduce(
  (sorters, {type, fieldName, sortType }) => ({
    ...sorters,
    [fieldName]:
      type === 'number' || sortType === 'number'
        ? compareNumbers
        : type === 'date' || sortType === 'date'
        ? compareDates
        : compareStrings,
  }),
  {}
);
return (direction, fieldName, array) => {
  const sortDirection = direction === 'asc' || direction === 1 ? 1 : -1;
  const compare = columnSorters[fieldName] || defaultSort;
  return [...array].sort((a, b) => compare(a[fieldName], b[fieldName]) * sortDirection);
}
};