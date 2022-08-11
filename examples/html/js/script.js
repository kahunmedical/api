let kahunCaseRecord;
let clinicalData = null;
let widgetSettings = {};
let overrides = null;

const defaultJs = `let kahunCaseRecord;
async function onKahunLoaded() {
   kahunCaseRecord = await Kahun.newCaseRecord({
      apiKey: "&lt;provided api key&gt",
      clinicId: "&lt;provided clinic id&gt",{caseProps}
   });
}
async function startKahunChat() {
   await kahunCaseRecord.startChatBotWidget({widgetSettings});
}`
const defaultHtml = `&lt;script src="https://patient.kahun.com/api/clientapi.js" onload="onKahunLoaded()" async&gt;&lt;/script&gt;
&lt;div id="kahun-patient"{windowAlign}&gt;&lt;/div&gt;
&lt;button class="kahun-button" onclick="startKahunChat()"&gt;Start Chat&lt;/button&gt;`
const demoInitialData = `{
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
}`

async function onKahunLoaded() {
    kahunCaseRecord = await Kahun.newCaseRecord({
        apiKey: "DuISmyrBbuac2EjGTAxYgatyQTPDKmM53sYbxt3M",
        clinicId: "799a2904-e59e-4ffe-8747-a762250c7a93",
        clinicalData,
        "overrides":overrides,
    });
    console.log("The new case id is", kahunCaseRecord.getCaseId())
}
async function startKahunChat() {
    await kahunCaseRecord.startChatBotWidget(widgetSettings);
}

function generateCode() {
    let caseProps = "";
    let windowAlign = "";
    let widgetSettingsCopy = {};
    clinicalData = null;
    overrides = {};
    widgetSettings = {};
    const radioButtons = document.querySelectorAll("input[name='windowAlign']")
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            windowAlign = radioButton.value;
            break;
        }
    }
    if (windowAlign) document.querySelector('#kahun-patient').setAttribute("data-window-alignment", windowAlign);

    const locale = stringValue('#locale');
    if (locale) {
        widgetSettingsCopy.locale = locale;
    }
    const utmString = stringValue('#utmString');
    if (utmString) {
        widgetSettingsCopy.utmString = utmString;
    }
    const onCompletionUrl = stringValue('#onCompletionUrl');
    if (onCompletionUrl) {
        widgetSettingsCopy.onCompletionUrl = onCompletionUrl;
    }
    const onAbandonUrl = stringValue('#onAbandonUrl');
    if (onAbandonUrl) {
        widgetSettingsCopy.onAbandonUrl = onAbandonUrl;
    }
    const initialData = stringValue('#initialData');
    if (initialData) {
        //let parsedInitialData = JSON.parse(initialData);
        clinicalData = JSON.parse(initialData);
        caseProps = "\nclinicalData:" + initialData;
    }
    const welcomePatient = stringValue('#welcomePatient');
    if (welcomePatient) {
        overrides.WELCOME_PATIENT = welcomePatient
    }
    if (Object.keys(overrides).length > 0) caseProps += (caseProps?",":"") + "\n\"overrides\":" + JSON.stringify(overrides)

    let widgetSettingsStr = '';
    if (widgetSettingsCopy && Object.keys(widgetSettingsCopy).length>0) {
        widgetSettingsStr = JSON.stringify(widgetSettingsCopy).replace('{','\n')
        widgetSettings = {
            ...widgetSettings,
            ...widgetSettingsCopy
        }
    }

    document.querySelector('#htmlCode').innerHTML = defaultHtml.replace('{windowAlign}',windowAlign?' data-window-alignment="' + windowAlign + '"':'');
    document.querySelector('#jsCode').innerHTML = defaultJs.replace('{caseProps}',caseProps?caseProps:'').replace('{widgetSettings}',widgetSettingsStr);
    Prism.highlightAll();

    onKahunLoaded();
    reloadButton();
}

function toggleSection(e,objId) {
    e.classList.toggle('open');
    document.querySelector(objId).classList.toggle('open');
}

function resetCode() {
    document.querySelector('#genForm').reset();
    document.querySelector('#kahun-patient').removeAttribute("data-window-alignment");
    generateCode();
}

function reloadButton() {
    const button = document.querySelector('#kahunButton');
    var newone = button.cloneNode(true);
    button.parentNode.replaceChild(newone, button);
}

function stringValue(selector) {
    return document.querySelector(selector).value.trim();
}

function addDemoData() {
    document.querySelector('#initialData').value = demoInitialData;
}

window.onload = () => {
    generateCode();
}