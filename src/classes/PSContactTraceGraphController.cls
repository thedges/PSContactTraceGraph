public without sharing class PSContactTraceGraphController {
    @AuraEnabled
    public static String getData(String recordId)
    {
        //https://gist.githubusercontent.com/bumbeishvili/dc0d47bc95ef359fdc75b63cd65edaf2/raw/c33a3a1ef4ba927e3e92b81600c8c6ada345c64b/orgChart.json
        List<Map<String, Object>> caseList = new List<Map<String, Object>>();

        Case tmpCase = [SELECT HierarchyId__c FROM Case WHERE id = :recordId];

        for (Case c : [SELECT Id, ParentId, CaseNumber, Subject, Type, Quarantine_Type__c, Status,
                              ContactId, Contact.Name, Contact.Phone, Contact.MobilePhone, Contact.Email, Contact.DoNotCall,
                              Contact.First_Responder__c, Contact.HasCOVID_19__c,
                              Contact.Quarantined__c, Contact.Covid_19_Risk_Assessment__c, Contact.MailingCity,
                              AccountId, Account.Name
                         FROM Case 
                        WHERE HierarchyId__c = :tmpCase.HierarchyId__c])
        {
            Map<String, Object> caseMap = new Map<String, Object>();

            caseMap.put('caseId', c.Id);
            caseMap.put('caseParentId', c.ParentId);
            caseMap.put('caseNumber', c.CaseNumber);
            caseMap.put('caseSubject', c.Subject);
            caseMap.put('caseType', c.Type);
            caseMap.put('caseStatus', c.Status);
            caseMap.put('caseQuarantineType', c.Quarantine_Type__c);
            caseMap.put('contactId', c.ContactId);
            caseMap.put('contactName', c.Contact.Name);
            caseMap.put('contactPhone', c.Contact.Phone);
            caseMap.put('contactMobile', c.Contact.MobilePhone);
            caseMap.put('contactEmail', c.Contact.Email);
            caseMap.put('contactCity', c.Contact.MailingCity);
            caseMap.put('contactQuarantined', c.Contact.Quarantined__c);
            caseMap.put('contactRiskAssessment', c.Contact.Covid_19_Risk_Assessment__c);
            caseMap.put('firstResponder', c.Contact.First_Responder__c);
            caseMap.put('doNotCall', c.Contact.DoNotCall);
            caseMap.put('accountId', c.AccountId);
            caseMap.put('accountName', c.Account.Name);

            //if (c.Contact.HasCOVID_19__c || c.Status == 'Asymptomatic' || c.Status == 'Symptomatic' || c.Status == 'Tested Positive')
            if (c.Contact.HasCOVID_19__c || c.Status == 'Tested Positive')
            {
                caseMap.put('contactStatus', 'Positive');
            }
            else if (c.Status == 'Left Message' || c.Status == 'New' || c.Status == 'Could Not Contact' ) 
            {
                caseMap.put('contactStatus', 'Needs Contacting');
            }
            else 
            {
                caseMap.put('contactStatus', 'Contacted');
            }


            caseList.add(caseMap);
        }

        return JSON.serialize(caseList);

        /*
        Http h = new Http();

        // Instantiate a new HTTP request, specify the method (GET) as well as the endpoint
       HttpRequest req = new HttpRequest();
       req.setEndpoint('https://gist.githubusercontent.com/bumbeishvili/dc0d47bc95ef359fdc75b63cd65edaf2/raw/c33a3a1ef4ba927e3e92b81600c8c6ada345c64b/orgChart.json');
       req.setMethod('GET');
   
       // Send the request, and return a response
       HttpResponse res = h.send(req);
       return res.getBody();
       */
    }
}