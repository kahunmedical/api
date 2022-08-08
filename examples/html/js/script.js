let kahunCaseRecord;
let widgetSettings = {};

const defaultJs = `let kahunCaseRecord;
async function onKahunLoaded() {
   kahunCaseRecord = await Kahun.newCaseRecord({
      apiKey: "Your API Key",
      clinicId: "Your Clinic Id",{caseProps}
   });
}
async function startKahunChat() {
   await kahunCaseRecord.startChatBotWidget({widgetSettings});
}`
const defaultHtml = `&lt;script src="https://patient.kahun.com/api/clientapi.js" onload="onKahunLoaded()" async&gt;&lt;/script&gt;
&lt;div id="kahun-patient"{windowAlign}&gt;&lt;/div&gt;
&lt;button class="kahun-button" onclick="startKahunChat()"&gt;Start Chat&lt;/button&gt;`
async function onKahunLoaded() {

    kahunCaseRecord = await Kahun.newCaseRecord({
        apiKey: "DuISmyrBbuac2EjGTAxYgatyQTPDKmM53sYbxt3M",
        clinicId: "74e8a537-d812-4f36-9ff2-c724a223d3e0",
        // clinicalData: {
        //     "caseFormat": "athena",
        //     "case": {
        //         "demographics": {
        //             "age": 54,
        //             "gender": "M"
        //         },
        //     }
        // }
    });
    console.log("The new case id is", kahunCaseRecord.getCaseId())

}
async function startKahunChat() {
    await kahunCaseRecord.startChatBotWidget(widgetSettings);
}

function generateCode() {
    let caseProps = null;
    let windowAlign = null;
    let widgetSettingsCopy = {};
    const radioButtons = document.querySelectorAll("input[name='windowAlign']")
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            windowAlign = radioButton.value;
            break;
        }
    }
    const locale = document.querySelector('#locale').value;
    if (locale) {
        widgetSettings.locale = locale;
        widgetSettingsCopy.locale = locale;
    }
    const onCompletionUrl = document.querySelector('#onCompletionUrl').value;
    if (onCompletionUrl) {
        widgetSettings.onCompletionUrl = onCompletionUrl;
        widgetSettingsCopy.onCompletionUrl = onCompletionUrl;
    }
    if (locale) {
        widgetSettings.locale = locale;
        widgetSettingsCopy.locale = locale;
    }


    document.querySelector('#htmlCode').innerHTML = defaultHtml.replace('{windowAlign}',windowAlign?' data-window-alignment="' + windowAlign + '"':'');
    document.querySelector('#jsCode').innerHTML = defaultJs.replace('{caseProps}',caseProps?caseProps:'').replace('{widgetSettings}',widgetSettings && Object.keys(widgetSettings).length>0?JSON.stringify(widgetSettingsCopy):'');
    Prism.highlightAll();
}

window.onload = () => {
    generateCode();
}