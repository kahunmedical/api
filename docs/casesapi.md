## **Partner Integration API**

### **Overview**

Kahun provides a REST API to allow partners to integrate with the patient intake chat service. Using the API, the
partner can:

* Create a new patient interaction case record, which is given a unique ID by the system.
* Contribute clinical and demographic patient information to the case.
* Generate a unique url link which can be shared with the patient. The link launches the patient interaction session.
* Poll the system for the current status of the interaction.
* Receive a text summary of the patient interaction.
* Get a link which launches a provider-facing interactive Patient Card which contains all information and insights from
  the interaction.


### **Postman Collection**
Postman (postman.com) is a free tool for testing APIs. We provide a Postman collection which you can import to try out the API described in this document and see working examples.  
Remember to configure the collection and add your provided CLINIC_ID and API_KEY to the Variables Section.

<a href="./postman_collection.json" download>Download Postman Collection</a>
 

### **API Key**

In order to use the API, you will be provided an API key which should be passed as a header on all HTTPS POST requests
to the API. \
The format of the header is: 

<table>
  <tr>
   <td>x-api-key
   </td>
   <td>provided api key
   </td>
  </tr>
</table>

### **Clinic Key**

Patient sessions created through the API should be associated with a provided ‘Kahun Clinic ID’. This provides a means
to customize and manage interaction settings using the clinic section of the Kahun Website, and enables Kahun to
customize settings for a particular use case.

To associate the sessions with a clinic, send the clinic-ID using a header on all HTTPS POST requests to the API.

The format of the header is:


<table>
  <tr>
   <td>x-kahun-clinic-id</td>
   <td>provided clinic ID</td>
  </tr>
</table>

### **Create New Patient Interaction Case Record**

A case record represents a specific intake interaction between a patient and the Kahun chat system. Once the case record
is created, the patient can initiate the chat at any future point

URL:  [https://api.kahun.com/cases](https://api.kahun.com/cases)

Method: POST

#### Headers:

<table>
  <tr>
   <td>x-api-key
   </td>
   <td>provided api key
   </td>
  </tr>
  <tr>
   <td>x-kahun-clinic-id
   </td>
   <td>clinic Id from clinic management page
   </td>
  </tr>
  <tr>
   <td>content-type
   </td>
   <td>application/json
   </td>
  </tr>
</table>

#### Body:

Kahun supports the following:

* **An empty JSON object**
   ```json
    {}
  ```

This will create a case record with no initial patient information.

* **Initial clinical and demographic data.**  \
  The supported format for clinical data is a JSON formatted object. The format specification matches the Athena Health
  API (see _[https://docs.athenahealth.com/api/docs/charts](https://docs.athenahealth.com/api/docs/charts)_), but is
  general enough to be created from a variety of source data.

Example:

```json
{
  "caseFormat": "athena",
  "case": {
    "demographics": {
      "age": 54,
      "gender": "M"
    },
    "problems": [
      {
        "lastmodifieddatetime": "2021-04-14T02:19:14-04:00",
        "name": "Renal disorder",
        "codeset": "SNOMED",
        "code": "420279001"
      }
    ]
  }
} 
```

* **Text Overrides** \
  Each request can also have a overrides object, which enables to customize texts shown in the Patient1st application. You can customize text using plain text or html formatted text.\
  \
 To use html formatting, your entire content should be enclosed in a valid html tag (for example, a `<div>` tag). 

```json
{
  "overrides": {
    "WELCOME_PATIENT": "Welcome text appearing at top of cover page",
    "WELCOME_PARTNERS":  "Main text of welcome cover page",
    "THANK_YOU_PATIENT": "Customized thank you text",
    "THANKS_SUB_TITLE": "Additional thank you page content"
  }
}
```

These are the supported custom fields:
<table>
  <tr>
   <td><em>FIELD</em>
   </td>
   <td><em>DESCRIPTION</em>
   </td>
  </tr>
  <tr>
   <td>WELCOME_PATIENT
   </td>
   <td>Text that the patient will see in the Patient1st welcome screen 
   </td>
  </tr>
  <tr>
   <td>THANK_YOU_PATIENT
   </td>
   <td>Text that the patient will see in the Patient1st Thank you screen 
   </td>
  </tr>
</table>

#### Response

The response is a JSON document with the following properties. All values below are of type string.

<table>
  <tr>
   <td><em>FIELD</em>
   </td>
   <td><em>DESCRIPTION</em>
   </td>
  </tr>
  <tr>
   <td>patient
   </td>
   <td>A URL link for the patient of Kahun’s Patient1st application. This link can be shared with the patient.
   </td>
  </tr>
  <tr>
   <td>provider
   </td>
   <td>A URL link for the physician which displays the Patient Card web interface. The Patient Card displays the summary and Kahun’s insights relating to the patient background and present findings. 
   </td>
  </tr>
  <tr>
   <td>status
   </td>
   <td>A URL link to a JSON document providing the current status of the interaction. This link can be periodically polled to receive updated status.
   </td>
  </tr>
  <tr>
   <td>summary
   </td>
   <td>A URL link to a JSON document representing a textual summary for the patient case.
   </td>
  </tr>
  <tr>
   <td>widgetSettings
   </td>
   <td>Attributes which can be passed to the front-end widget in order to initialize the patient-facing application (see Widget section below).
   </td>
  </tr>
  <tr>
   <td>caseId
   </td>
   <td>The unique ID for this case record
   </td>
  </tr>
  <tr>
   <td>pdf
   </td>
   <td>A URL link which downloads a pdf document with a formatted version of the summary information
   </td>
  </tr>
</table>

### **Retrieving the Case Summary**

The summary is retrieved from the ‘summary’ link, which is returned when the case record is created. The summary
contains a textual description of the case, as well as structured information generated from Kahun’s clinical reasoning
engine.

The summary can be used to copy Kahun’s output to an external system, for example, as a case note to an EHR system.

Here is the basic structure of the summary JSON document

```json
{
  "patientSummary": {
    "data": {
      "age": "<number>",
      "gender": "<Female | Male>",
      "main": "<Chief Complaint>",
      "sections": [
        {
          "title": "<section title>",
          "content": "<section text content>",
          "type": "<one of: assessment|dd|hpi|imaging|labs|pe|plan|referral|ros|suggested|triage_advice>"
        }
      ]
    }
  },
  "status": "<CREATED | IN_PROGRESS | COMPLETED | ABANDONED>",
  "mostLikelyCauses": [
    {
      "snomedid": "<snomed code>",
      "name": "<name of disease>",
      "strength": "<0-1 indicating strength of evidence>"
    }
  ],
  "lessLikelyCauses": [
    {
      "snomedid": "<snomed code>",
      "name": "<name of disease>",
      "strength": "<0-1 indicating strength of evidence>"
    }
  ],
  "navigationAdvice": {
    "level": "<number between 1-10, where 1 is the highest level of urgency>",
    "title": "<title of navigation advice>",
    "description": "<description>"
  }
}
```

Here is an example of a summary section:

```json
{
  "patientSummary": {
    "data": {
      "age": 23,
      "gender": "Female",
      "main": "Fever",
      "sections": [
        {
          "content": "Female, 23 years old, recently gave birth, presenting with fever between 100.5°F (38.1°C) and 104.0°F (40°C) for a duration of one day to one week. Patient describes the fever as intermittent.\n\nPatient has medical history of: Neurofibroma, inflammatory pseudotumor of orbit, atrial fibrillation, prediabetes and angioedema.",
          "title": "History of present illness",
          "type": "hpi"
        },
        {
          "content": "The patient is also suffering from cough (duration one day to one week and character productive), headache (location frontal region, temporal region, severity moderate and duration one day to one week) and dysphagia (duration one day to one week).\n\nThe patient denies: sneezing, difficulty breathing, diaphoresis, sore throat, chills, fatigue, disordered taste, nasal congestion, loss of appetite, muscle pain and loss of sense of smell.\n",
          "title": "Review of systems",
          "type": "ros"
        },
        {
          "content": "Patient presenting for evaluation of fever. Patient has associated symptoms of cough, headache and dysphagia.\n\nDiagnosis is most consistent with pneumonia.\n\nOther possible causes to be considered include sinusitis and bronchitis. \n\n",
          "title": "Assessment",
          "type": "assessment"
        }
      ]
    }
  },
  "status": "COMPLETED"
}
```

### **Retrieving the status of the case record**

The status is retrieved from the ‘status’ link, which is returned when the case record is created.

The status link can be periodically polled and will return the current state of the record. In addition it will return
current links, as in the original response.

The status is a JSON document:

```json
{
  "status": "CREATED",  // "IN_PROGRESS" | "COMPLETED" | "ABANDONED",
  "questionsCount": 28,
  "conversationProgress": 100
}
```

<table>
  <tr>
   <td><em>FIELD</em>
   </td>
   <td><em>TYPE</em>
   </td>
   <td><em>DESCRIPTION</em>
   </td>
  </tr>
  <tr>
   <td>status
   </td>
   <td>string
   </td>
   <td>CREATED: Case was created. Patient did not answer a question yet.
<p>
IN_PROGRESS: Patient answered at least one question but did not complete the conversation.
<p>
COMPLETED: Patient completed the conversation. 
   </td>
  </tr>
  <tr>
   <td>questionCount
   </td>
   <td>number
   </td>
   <td>The number of questions the patient answered. 
   </td>
  </tr>
  <tr>
   <td>conversationProgress
   </td>
   <td>number
   </td>
   <td>An approximate progress in percentage. This is a heuristic measure of the percentage of the clinical intake process that has been completed 
   </td>
  </tr>
</table>

## Webhook Integration

Using the webhook integration, you can receive asynchronous notifications to your system when the status of any
previously-created case record changes, and receive the summary information for a case record when it is available.

Using the webhook allows you to create a single point to process all incoming information across all cases from a single
Kahun Clinic ID.

### **Limitations**

Only one webhook can be defined per Kahun Clinic ID. 

The Kahun system will retry delivery of notifications only a limited number of times. To use webhook integration, you
must provide a service with enough capacity for the expected rate of notifications.

_Currently, webhook integration requires setup via Kahun support._

### **HTTPS Protocol**

Notifications are delivered using HTTPS POST to a publicly accessible URL provided during setup of the webhook
The body of the post will be in JSON format as described below

### **Message Body Format**

Each message may contain one or more separate notification messages, and will be wrapped in a JSON array field called
“notifications”

```json
{
  "clinicId": "<originating clinic id>",
  "jwtSignature": "<string>",
  "notifications": [
    "<notifcation1>,<notifcation2>"
  ]
} 
```

#### Notification Format

Each individual notification indicates a change of status of a single case record

```json
{
  "caseId": "<case recordid>",
  "time": "<a timestamp string>",
  "status": "<string>",
  "conversationProgress": "<number>",
  "patientSummary": "<summary data  object>"
}
```

For detailed descriptions of the data fields, please see the previous sections
[Retrieving the status of the case record](#retrieving-the-status-of-the-case-record)
[Retrieving the Textual Case Summary](#retrieving-the-case-summary)

The _status_, _conversationProgress_, and _patientSummary_ fields use the same format as the corresponding fields in the
REST API.

<table>
  <tr>
   <td><em>FIELD</em>
   </td>
   <td><em>DESCRIPTION</em>
   </td>
  </tr>
  <tr>
   <td>caseId
   </td>
   <td>The unique case record id which was returned when the case record was created.
   </td>
  </tr>
  <tr>
   <td>time
   </td>
   <td>The time of the status change
   </td>
  </tr>
</table>

##### Patient Summary

The patient summary is only included in the notification when the status has changed to either COMPLETED or ABANDONED.

## Chat User Interface

The patient-facing chat application can be run either as a standalone web-page, or as an embedded widget within a 3-rd
party web application.

### **Standalone Web Application**

The standalone web application is a responsive web app which is designed to be usable on a wide range of devices both
desktop and mobile. To launch the standalone application, launch the url which is provided under the _patient _property
returned when the case record was created.

### **Widget Integration**

Kahun’s chat can be run as an integrated HTML element embedded in a client’s page.

#### **HTML Integration**

In order to integrate a widget-like element in your HTML page, take the following steps:

##### Before you begin integration

Coordinate with Kahun staff the domain(s) which are going to host the widget. The Kahun backend must be configured with
your domain details to prevent CORS errors when using Kahun code on your website.

##### Page Integration

1. Load the Kahun library code on page load.  \
   Use a script tag as follows (nested within the `<body>` tag in the page):

```html
<script src="https://patient.kahun.com/embed.js"></script>
```

2. Create a div element on the page which will hold the widget.  \
   The div element should have the following id: id=”kahun-patient” . Kahun code will place the widget into the DOM
   within the div you have provided. \
   \
   The div tag is configured using html attributes below. Note that the _settings_ attribute is special and is a JSON
   formatted string.

_In some cases, you may want to delay the widget appearing until some event has happened (for example, a button has been
pressed), and/or some backend code has run. In those cases, follow instructions in
the [Delayed Initialization](#delayed-initialization) section_

```html

<div
        id="kahun-patient"
        data-window-alignment="left" (optional)
        data-button-layout="floating-icon" (optional)
        data-button-text="Start your diagnosis now" (optional)
        settings='{
   "locale":"<LOCALE>",
   "sessionId":<SESSION_ID>,
   "partnerId":"<PARTNER_ID>",
   "icon":"<URL_TO_AN_ICON>",
   "open":<true|false>,
   "clinicId":"<CLINIC_ID>",
   "patientCaseId":"<CASE_ID>",
   "utmString":"<UTM_PARAMS>",
   "onCompletionUrl": "<REDIRECT URL>"
 }'
>
</div>
```

All parameters are optional and the app will still run if only some of them are presented.

#### **Customizing chat window alignment and button view**

##### Window alignment

It is possible to load the Kahun chat in 4 different layout variations for desktop view, to do so change
the `data-window-alignment `attribute of the "kahun-patient"  container div.

**NOTE:** in mobile the chat window will always spread responsively to overlay almost the entire screen.

Here is a list of supported alignment variations:

<table>
  <tr>
   <td>Attribute value</td>
   <td>Description</td>
   <td>Screenshoot</td>
  </tr>
  <tr>
   <td>data-window-alignment="left" </td>
   <td>Window is aligned to the <strong>left</strong> side of the screen<strong> (default)</strong></td>
   <td>

[//]: # (<img src="images/image1.png" width="" alt="alt_text" title="image_tooltip">)
   </td>
  </tr>
  <tr>
   <td>data-window-alignment="right" </td>
   <td>Window is aligned to the <strong>right</strong> side of the screen (default)</td>
   <td>

[//]: # (<img src="images/image2.png" width="" alt="alt_text" title="image_tooltip">)
   </td>
  </tr>
  <tr>
   <td>data-window-alignment="center"</td>
   <td>The window will open in a pop-up like view the middle of the screen with a dark background over the content of the page</td>
   <td>

[//]: # (<img src="images/image3.png" width="" alt="alt_text" title="image_tooltip">)
   </td>
  </tr>
  <tr>
   <td>data-window-alignment="fullscreen"</td>
   <td>This value is used for clients who wish to load the chat as a standalone app that takes over the entire content of the page.<p> NOTE: if in “fullscreen” mode the user cannot close/minimize the chat screen
   </td>
   <td>

[//]: # (<img src="images/image4.png" width="" alt="alt_text" title="image_tooltip">)
   </td>
  </tr>
</table>

##### Button layout

The widget can optionally start as a small icon button, with the main interface only opening after the button is
pressed. This is the default behavior of the widget, which can be overridden by including the following in the settings
attribute:

```json
{
  "open": true
}
```

It is possible to customize the layout of the “open chat” icon. You can modify whether it would be a floating icon
rendered at a fixed position of the window, or an icon inline with the contents of the page. You can also control the
text rendered on the icon. (To modify the visual icon itself, use the
[icon setting ](#icon-setting))

Here is a list of supported alignment variations:
<table>
  <tr>
   <td>Attribute value
   </td>
   <td>Description
   </td>
   <td>Screenshoot
   </td>
  </tr>
  <tr>
   <td>data-window-alignment="floating-icon"
   </td>
   <td>The button is rendered as an icon in the left/right area of the page (based on data-window-alignment attribute value) if  

<a href="#heading=h.eort2rkvdhbj">icon setting</a> is set then the icon will be rendered <strong>(default)</strong>
   </td>
   <td>

[//]: # (<img src="images/image5.png" width="" alt="alt_text" title="image_tooltip">)
   </td>
  </tr>
  <tr>
   <td>data-window-alignment="static-icon"
   </td>
   <td>The button is rendered as part of the window content if icon setting is set then the url provided will be rendered as an icon
   </td>
   <td>

[//]: # (<img src="images/image6.png" width="" alt="alt_text" title="image_tooltip">)

</td>
  </tr>
  <tr>
   <td>data-window-alignment="text-button"
   </td>
   <td>A round static button is rendered as part of the page content. With the default text “Start your diagnosis”. 
<p>
<strong>This text can be overridden using the  <code>data-button-text </code>attribute</strong>
   </td>

<td>

[//]: # (<img src="images/image7.png" width="" alt="alt_text" title="image_tooltip">)
</td>
  </tr>
  <tr>
   <td>data-window-alignment="floating-text-button"
   </td>
   <td>A round button is rendered in the left/right area of the page (based on data-window-alignment attribute value). 
<p>
With the default text “Start your diagnosis”. 
<p>
<strong>This text can be overridden using the  <code>data-button-text </code>attribute</strong>
   </td>
   <td>

[//]: # (   <img src="images/image8.png" width="" alt="alt_text" title="image_tooltip">)
   </td>
  </tr>
  <tr>
   <td>data-button-text="Start Chat"
   </td>
   <td>The button text
   </td>
   <td>
   </td>
  </tr>
</table>

#### **Integration with CASES REST API**

When integrating with the cases-api, the settings attribute must contain the contents provided by the API in the _
widgetSettings _property.

Using the settings provided by the API will load a chat-bot which is linked to the case record previously created
through the API.
You can merge the widgetSettings provided from the API with any additional settings to create the final settings object
which is passed to the widget

```javascript
let settings = JSON.stringify({
    ...widgetSettings,
    "locale": "en",
    "open": true
})
```

#### **Optional Widget Settings**

<table>
  <tr>
   <td><em>FIELD NAME</em>
   </td>
   <td><em>TYPE</em>
   </td>
   <td><em>DESCRIPTION</em>
   </td>
   <td><em>SUPPORTED VALUES </em>
   </td>
  </tr>
  <tr>
   <td>locale
   </td>
   <td>string
   </td>
   <td>In what display language the app should run
   </td>
   <td>
“en” - English (default)
“he” - Hebrew
“fr” - French
“pt” -  Portuguese
“es” - Spanish  
   </td>
  </tr>
  <tr>
   <td>icon
   </td>
   <td>url
   </td>
   <td>What icon image to display while the widget is closed. 
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>open (optional)
   </td>
   <td>true | false
   </td>
   <td>Whether the app should start open as the page loads or start in a minimized state. 
<strong>Default: false</strong>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>clinicId, partnerId, 
<p>
patientCaseId 
   </td>
   <td>internal
   </td>
   <td>Session information
   </td>
   <td>Should be populated from the create case api (widgetSettings). For other integration use-cases, will be provided by Kahun support.
   </td>
  </tr>
  <tr>
   <td>utmString (optional) 
   </td>
   <td>URL encoded UTM code
   </td>
   <td>Used when navigation out of the widget to a partner page, these utm params will be appended to the URL
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>onCompletionUrl
   </td>
   <td>URL
   </td>
   <td>If provided the widget will redirect to this url at the end of the conversation. 
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>onAbandonUrl
   </td>
   <td>URL
   </td>
   <td>If provided the widget will redirect to this url when user abandoned the conversation 
   </td>
   <td>
   </td>
  </tr>
</table>

##### Delayed initialization

In some scenarios you may want to start the chat only after an API server call or after a user interaction (i.e.
creating a customized button. asking the user to fill in some information, loading some user data etc.)
A common scenario is to have a custom ‘start chat’ button on the page. In response to clicking on the button, the page
will call the backend to create the case record, and then display the widget .

In order to accomplish this, create a `<div id="kahun-patient"></div>` _Without a settings attribute._

By creating the div without the settings attribute, the Kahun code will not display the widget immediately, but will
wait for a programmatic call from the page to open the widget.

##### **initKahunPatient**

The _window.initKahunPatient_ is a javascript function which can be called to configure and load the widget from
javascript code on the page.

The function takes a single parameter, which has the same format as the settings attribute, and essentially allows you
to programmatically set the settings attribute. (see [widget settings](#optional-widget-settings))

```javascript
window.initKahunPatient({...settings, open: true});
```

The _open_ flag will control whether the chat opens immediately, or whether a launch button will be shown. If you do not
wish the chat to open automatically but rather just show the start chat button you may remove `open: true `

Here is a complete example which you can fork or copy, implementing a custom button, and widget initialization showing
integration with the API:

[https://codepen.io/kahunapi/pen/rNJdvPq](https://codepen.io/kahunapi/pen/rNJdvPq)

#### **CSS Customization**

We've added CSS classes to have better support in changing the layout from outside the app.

##### kahun-container

The highest CSS class is _.kahun-container,_ in order to change the entire area where the widget is rendered you may
use _.kahun-container_

For example, to make the widget look properly placed in the page you may append this css rule to your HTML page:

```css
patient .kahun-container {
    left: 0;
    bottom: 40px;
    position: fixed;
    z-index: 1500;
}
```

##### open-kahun-icon

Another CSS class added is _.open-kahun-icon_ which wraps the round icon that opens the chat, so the following rule can
be added to alter the “open” button location

```css
#kahun-patient .open-kahun-icon {
    right: auto;
    left: 15%;
}
```

#### **Page Events**

The widget emits events using the javascript event mechanism. Code on the page can subscribe to these events to be
notified of changes to the widget state

Example:

```javascript
window.addEventListener("kahun_widget_state", (evt) => {
    if (evt.state == "closed")
        console.log("user has closed the chat widget");
})
```

Events are emitted using the ‘window’ object.

<table>
  <tr>
   <td><em>Event</em>
   </td>
   <td><em>Description</em>
   </td>
   <td><em>Sample Payload</em>
   </td>
  </tr>
  <tr>
   <td>
    <h7>kahun_widget_state</h7>
   </td>
   <td>Reports on whether the widget <em>interface</em> is open or close
   </td>
   <td>
<code>
{ 
 "type":"kahun_widget_state",
 "state": "open", 
  "status": "IN_PROGRESS" 
}</code>
   </td>
  </tr>
  <tr>
   <td>
<h7>kahun_session_status</h7>
   </td>
   <td>Reports on progress of the interactive chat session
   </td>
   <td><code>{ 
  "type": "kahun_session_status", 
  "progress": 80, 
  "status":  "IN_PROGRESS" 
}</code>
   </td>
  </tr>
</table>

