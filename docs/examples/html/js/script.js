
function printToStatus(txt,color) {
    const terminal = document.querySelector('#terminal');
    terminal.innerHTML +=  (color?`<span style="color:${color}">${txt}</span>`:txt) +'<br/>';
    terminal.scrollTop = terminal.scrollHeight;
}

function clearStatus() {
    document.querySelector('#terminal').innerHTML = '';
}

function toggleSection(e,objId) {
    e.classList.toggle('open');
    document.querySelector(objId).classList.toggle('open');
}

function escapeHtml(unsafe)
{
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function stringValue(selector) {
    return document.querySelector(selector).value.trim();
}

function addDemoData(selector) {
    document.querySelector(selector).value = `{
      "caseFormat": "athena",
      "case": {
        "demographics": {
          "age": 54,
          "gender": "M"
        },
        "problems": [
          {
            "lastmodifieddatetime": "2022-04-14T02:19:14-04:00",
            "name": "Renal disorder",
            "codeset": "SNOMED",
            "code": "420279001"
          }
        ]
      }
    }`;
}