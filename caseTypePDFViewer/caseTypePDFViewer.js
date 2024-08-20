import { LightningElement, wire, api} from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import uploadPDF from '@salesforce/apex/PDFUploaderController.uploadPDF';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import g28 from '@salesforce/resourceUrl/G28';
import g845 from '@salesforce/resourceUrl/G845';
import i131 from '@salesforce/resourceUrl/I131';
import i360 from '@salesforce/resourceUrl/I360';
import i356 from '@salesforce/resourceUrl/I356';
import i363 from '@salesforce/resourceUrl/I363';
import i485 from '@salesforce/resourceUrl/I485';
import MATTER_NAME_FIELD from '@salesforce/schema/Matter__c.Name';
//import CASE_TEXT_FIELD from '@salesforce/schema/Matter__c.Case_Text__c';
import VERSION_DATA_FIELD from '@salesforce/schema/ContentVersion.VersionData';
import CASE_TYPE_FIELD from '@salesforce/schema/Matter__c.Case_Type__c';
import CONTENT_VERSION_ID from '@salesforce/schema/ContentDocument.LatestPublishedVersionId';
const FIELDS = [
    MATTER_NAME_FIELD,
    CASE_TYPE_FIELD
];

export default class CaseTypePDFViewer extends LightningElement {
    @api recordId;
    @api pdfHeight = 1000;
    @api pdfWidth = 1000;
    matter;
    fileName = 'Document.pdf'; // Set default file name

    handleSavePdf() {
        // Convert PDF URL to base64
        this.fetchPDFAsBase64().then(base64Data => {
            uploadPDF({ recordId: this.recordId, contentBase64: base64Data, fileName: this.fileName })
                .then(() => {
                    this.showToast('Success', 'PDF has been successfully saved.', 'success');
                })
                .catch(error => {
                    this.showToast('Error', 'Failed to save PDF: ' + error.body.message, 'error');
                });
        }).catch(error => {
            this.showToast('Error', 'Failed to convert PDF: ' + error.message, 'error');
        });
    }

    fetchPDFAsBase64() {
        return new Promise((resolve, reject) => {
            fetch(this.StaticURL)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                    resolve(base64);
                })
                .catch(error => reject(error));
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(evt);
    }

    @wire(getRecord, {recordId: '$recordId', fields: FIELDS})
    wiredMatter({ error, data }) {
        if (data) {
            this.matter = data;
        } else if (error) {
            console.error('Error fetching matter record', JSON.stringify(error));
        }
    }
 
    get caseType() {
        return getFieldValue(this.matter, CASE_TYPE_FIELD);
    }
  //  @wire(getRecord, { recordId: '<docid>', fields: [CONTENT_VERSION_ID] })
 // contentdocument;
 get StaticURL() {
    if (this.caseType === 'G28') {
        return `${g28}`;
    }
    if (this.caseType === 'I131'){
        return `${i131}`;
    }
    if (this.caseType === 'I360'){
        return `${i360}`;
    }
    if (this.caseType === 'I356'){
        return `${i356}`;
    }
    if (this.caseType === 'I363'){
        return `${i363}`;
    }
    if (this.caseType === 'I485'){
        return `${i485}`;
    }
    return '';
    }
    get isStaticURLPresent() {
        return this.StaticURL !== '';
    }
 
}

