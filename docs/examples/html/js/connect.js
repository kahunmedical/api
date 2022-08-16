async function connectToApi() {
    clearStatus();
    clearCaseLinks();
    printToStatus('Connecting to API...','blue');
    toggleLoading(true);
    const apiKey = document.querySelector('#apiKey').value;
    const clinicId = document.querySelector('#clinicId').value;
    const body = document.querySelector('#initialData').value.trim();

    await fetch('https://api.kahun.com/cases', {
        method: "POST",
        headers: {
            'x-api-key': apiKey,
            'x-kahun-clinic-id': clinicId,
            'Content-Type': 'application/json',
        },
        body: body || JSON.stringify({}),
    })
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            clearStatus();
            showCase(data);
        })
        .catch((error) => {
            clearStatus();
            printToStatus('Error:' + error, 'red');
        })
        .finally(() => toggleLoading(false));
}

function showCase(data) {
    let result = JSON.stringify(data)
        .replaceAll(',',',\n')
        .replaceAll('{','{\n')
        .replaceAll('}','\n}')
    printToStatus(indent.js(result, {tabString: '\t'}));
    Prism.highlightAll();
    createCaseLinks(data);
}

function toggleLoading(on) {
    document.querySelector('#connectButton').style.opacity = on? '0.6' : '1';
    document.querySelector('#connectButton').disabled = on;
}

function resetCode() {
    document.querySelector('#connectForm').reset();
    clearStatus();
    clearCaseLinks();
}

function createCaseLinks(caseData) {
    clearCaseLinks();
    const linksCont = document.querySelector('#caseLinks');
    if (caseData.provider) linksCont.insertAdjacentHTML('beforeend',`<a href="${caseData.provider}" target="_blank">Patient Assessment</a>`);
    if (caseData.patient) linksCont.insertAdjacentHTML('beforeend',`<a href="${caseData.patient}" target="_blank">Patient Chat</a>`);
    if (caseData.summary) linksCont.insertAdjacentHTML('beforeend',`<a href="${caseData.summary}" target="_blank">Summary</a>`);
    if (caseData.status) linksCont.insertAdjacentHTML('beforeend',`<a href="${caseData.status}" target="_blank">Status</a>`);
    if (caseData.pdf) linksCont.insertAdjacentHTML('beforeend',`<a href="${caseData.pdf}" target="_blank">PDF</a>`);
}

function clearCaseLinks() {
    document.querySelector('#caseLinks').innerHTML = '';
}