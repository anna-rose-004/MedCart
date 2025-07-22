# MedCart
MedCart is a smart crash cart management system designed for hospitals, featuring real-time inventory tracking, QR-based medicine scanning, automated restocking, secure user roles, and patient-linked dispensing workflows.

---

##  Why MedCart?

In many hospitals, **nurses manually log expiry dates of medicines in crashcart**. This process is:

-  Time-consuming  
-  Error-prone

  **MedCart** solves these problems by enabling:

- QR code scanning of medicine batches  
- Pharmacist-driven refills to department-specific crash carts  
- Secure digital logging of medicines for future audits  
- Expiry validation before dispensing  
- Real-time alerts for expired or expiring stock  


##  Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Others:** QR Code Scanning, Role-based Access Control (RBAC)

---

## Core Features

-  **Add Medicines**: QR code scanning for quick batch uploads
-  **Dispense Medicines**: Only allowed if the item is not expired
-  **Role-Based Access**:
     -**Admin**: Manage users, roles, departments
     -**Pharmacist**: Add/update medicines, assign to departments
     -**Nurse**: Department-specific access to scan & dispense
-  **Expiry Alerts**: Notifications for expired or near-expiry medicines
-  **Audit Logging**: All activities stored for future audits
-  **Department-wise CrashCart Handling**
-  **Search and Filter**: Quickly locate medicines by name, date, department
---

## Contributors

- Anna Rose Thomas
- Archana P S
- Milka Joseph
- Siya Joe

## Acknowledgements
Thanks to the healthcare staff and pharmacists who inspired the features of MedCart through real-world pain points in hospital workflows.




