---
title: Projects
description: Create projects, view project information, and manage App Certificates in Agora Console.
---

## Create and manage projects

### Restrictions

- If your account has multiple members, only those assigned to the **Admin**, **Engineer**, or an authorized custom team can access the **Projects** page.
- Each Agora account can create up to 20 projects. If you need to create more projects, submit a support ticket.

### Create a project

1. Open the **Projects** page.
2. Click **Create New**.
3. Enter a project name and use case.
4. Select **App ID + Token (Recommended)** as the authentication mechanism.
5. Click **Submit**.

### View project information

On the **Projects** page, you can:

- View basic information such as created date, last updated date, name, and security status.
- Copy the App ID.
- Open project details to configure the project name, copy the App ID and App Certificate, and generate a temporary token.

### Manage App Certificates

Agora provides the following certificate options:

- **Primary Certificate**: used to generate tokens for temporary use or production environments.
- **Secondary Certificate**: used to generate tokens for production environments only; does not apply to RESTful APIs.

### Enable the Primary Certificate

- If you choose **App ID + Token** when creating a project, the Primary Certificate is enabled by default.
- If you choose **App ID** when creating a project, enable the Primary Certificate manually on the project details page.

### Enable the Secondary Certificate

If you need to change the Primary Certificate after enabling it, enable the Secondary Certificate on the project details page by clicking **Add a Certificate**.

### Switch to a new Primary Certificate

If you suspect that your Primary Certificate has been compromised:

1. Enable the Secondary Certificate.
2. Swap the certificates.
3. Disable the old secondary certificate.
4. Delete the original primary certificate after most users have switched to the new one.

Deleting a certificate invalidates all tokens generated with that certificate.
