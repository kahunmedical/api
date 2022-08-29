let kahunCaseRecord;
let clinicalData = null;
let wSettings = {};
let overrides = null;
let kahunWindowAlign = "";
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
const defaultHtml = `&lt;script src="https://patient.kahun.com/api/clientapi.js" async&gt;&lt;/script&gt;
&lt;div id="kahun-patient"{windowAlign}&gt;&lt;/div&gt;
&lt;button class="kahun-button" onclick="startKahunChat()"&gt;Start Chat&lt;/button&gt;`

function onKahunStateChange(evt) {
    console.log('state:', evt.state);
    printToStatus(`<i>Widget State:</i> ${evt.state}`);
    if (evt.state === 'closed') {
        toggleCloseButton(false);
        toggleChatPlaceholder(false);
    }
}

function onKahunStatusChange(evt) {
    printToStatus(`<i>Progress:</i> ${evt.progress}%`);
}

function onKahunDone(evt) {
    printToStatus("<strong>User has completed the chat</strong>");
    getSummary();
}

async function getSummary() {
    printToStatus("Getting summery...");
    // put summary data on screen
    const output = await kahunCaseRecord.generateSummary();
    const { patientSummary, navigationAdvice, mostLikelyCauses } = output;

    const summary = patientSummary?.data?.sections
        ?.map((s) => s?.content)
        .join("<br/>");
    printToStatus(`<br><strong>Summary:</strong></br>${summary}`)

    const likely = mostLikelyCauses?.map((c) => c.name).join("<br/>");
    printToStatus(`<br><strong>Likely causes:</strong></br>${likely}`)

    const navigation = navigationAdvice
        ? `${navigationAdvice.title}<br>${navigationAdvice.description}`
        : "No Navigation Advice Provided";
    printToStatus(`<br><strong>Navigation Advice:</strong></br>${navigation}`)
}


async function onKahunLoaded() {
    kahunCaseRecord = await Kahun.newCaseRecord({
        apiKey: "DuISmyrBbuac2EjGTAxYgatyQTPDKmM53sYbxt3M",
        clinicId: "0e50ee14-afa9-406c-aaf2-8410dd7b0e3d",
        clinicalData,
    });
    kahunCaseRecord.subscribe("widget_state", onKahunStateChange);
    kahunCaseRecord.subscribe("status", onKahunStatusChange);
    kahunCaseRecord.subscribe("done", onKahunDone);
    printToStatus("<strong>Kanun loaded</strong><br/>The new case id is " + kahunCaseRecord.getCaseId())
    toggleButton(true);
}

async function startKahunChat() {
    toggleCloseButton(kahunWindowAlign === 'center' || kahunWindowAlign === 'fullscreen');
    toggleChatPlaceholder(!kahunWindowAlign || kahunWindowAlign === 'left');
    await kahunCaseRecord.startChatBotWidget(wSettings);
}

function toggleChatPlaceholder(on) {
    document.querySelector('#chatPlaceHolder').classList.toggle('active', on);
}

function generateWidgetCode() {
    let caseProps = "";

    let widgetSettingsCopy = {};
    clinicalData = {};
    overrides = {};
    wSettings = {};
    const winAlignOptions = document.querySelectorAll("input[name='windowAlign']")
    for (const radio of winAlignOptions) {
        if (radio.checked) {
            kahunWindowAlign = radio.value;
            break;
        }
    }

    const kahunDiv = document.querySelector('#kahun-patient');
    kahunDiv.className = kahunWindowAlign;
    if (kahunWindowAlign) kahunDiv.setAttribute("data-window-alignment", kahunWindowAlign);

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
    if (initialData) clinicalData = JSON.parse(initialData);

    const welcomeLogo = stringValue('#welcomeLogo');
    if (welcomeLogo) {
        overrides.WELCOME_LOGO = welcomeLogo
    }
    const welcomePatient = stringValue('#welcomePatient');
    if (welcomePatient) {
        overrides.WELCOME_PATIENT = welcomePatient
    }
    const thankYouPatient = stringValue('#thankYouPatient');
    if (thankYouPatient) {
        overrides.THANK_YOU_PATIENT = thankYouPatient
    }
    const thanksSubTitle = stringValue('#thanksSubTitle');
    if (thanksSubTitle) {
        overrides.THANKS_SUB_TITLE = thanksSubTitle
    }

    if (Object.keys(overrides).length > 0) {
        clinicalData.overrides = overrides
    }
    console.log(overrides)
    if (Object.keys(clinicalData).length > 0) {
        //let parsedInitialData = JSON.parse(initialData);
        caseProps = "\nclinicalData:" + JSON.stringify(clinicalData).replaceAll('{','{\n').replaceAll('}','\n}').replaceAll(',',',\n');
    }

    let widgetSettingsStr = '';
    if (widgetSettingsCopy && Object.keys(widgetSettingsCopy).length>0) {
        widgetSettingsStr = JSON.stringify(widgetSettingsCopy)
        wSettings = {
            ...wSettings,
            ...widgetSettingsCopy
        }
    }

    let htmlCode = defaultHtml.replace('{windowAlign}',kahunWindowAlign?' data-window-alignment="' + kahunWindowAlign + '"':'');
    document.querySelector('#htmlCode').innerHTML = indent.js(htmlCode, {tabString: '\t'});
    let jsCode = defaultJs.replace('{caseProps}',caseProps?escapeHtml(caseProps):'').replace('{widgetSettings}',widgetSettingsStr);
    document.querySelector('#jsCode').innerHTML = indent.js(jsCode, {tabString: '\t'});
    Prism.highlightAll();
}

function toggleButton(on) {
    const button = document.querySelector('#kahunButton');
    if (on)
        button.classList.add('active');
    else
        button.classList.remove('active');
}

function resetCode() {
    document.querySelector('#genForm').reset();
    const kahunDiv = document.querySelector('#kahun-patient');
    kahunDiv.removeAttribute("data-window-alignment");
    generateNewCode();
}

function generateNewCode() {
    toggleButton(false);
    generateWidgetCode();
    kahunCaseRecord.release("widget_state", onKahunStateChange);
    kahunCaseRecord.release("status", onKahunStatusChange);
    kahunCaseRecord.release("done", onKahunDone);
    //can't use window.removeEventListener because handlers are anonymous
    closeWidget();
    clearStatus();
    onKahunLoaded();
}

function toggleCloseButton(on) {
    document.querySelector('#closeWidget').style.display = on? 'block':'none';
}

function closeWidget() {
    toggleCloseButton(false);
    kahunCaseRecord.removeChatBotWidget();
}

window.onload = function() { generateWidgetCode() }