
# FutureCo

FutureCo is a platform designed to connect founders with tech-savvy individuals looking to become co-founders. Founders can list their startup ideas along with salary, equity share, and other relevant details, while tech enthusiasts can browse these listings to find their perfect fit. Once a tech co-founder is identified, the founder can approve the request, granting the tech co-founder access to their contact information.

## Features

- **Founder Login via Google Auth**: Founders can securely log in using their Google account to create and manage their listings.
- **Tech Co-founder Login via GitHub**: Tech professionals can log in using their GitHub account to explore opportunities.
- **Listing Creation**: Founders can list their startup ideas along with details like salary, equity share, and more.
- **Co-founder Matching**: Tech co-founders can apply to relevant listings. Founders can approve applications if they believe the applicant is a good fit.
- **Notification System**: Once a tech co-founder is approved, they will be notified and provided with the founder's contact details to initiate communication.

## Installation

To get started with FutureCo, follow the steps below:

### Prerequisites

- Node.js
- npm or yarn
- Firebase (for authentication and Firestore database)

### Clone the repository

```bash
git clone https://github.com/your-username/futureco.git
cd futureco
```

### Install dependencies

```bash
npm install
# or
yarn install
```

### Firebase Configuration

You do **not** need to create an `.env` file for this project. All Firebase configuration is handled directly within the project using the Firebase SDK.

1. Set up Firebase in your project by creating a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. In your Firebase project, enable **Google Authentication** and **GitHub Authentication** in the Firebase Authentication section.
3. Enable **Firestore** in the Firebase console and set the following Firestore rules (as shown below).

### Firestore Rules

```firebase
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /startupListings/{listingId} {
      allow read: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            request.auth.uid == resource.data.founderId;
      allow create: if request.auth != null && 
                    request.auth.token.firebase.sign_in_provider == "google.com";

      match /applications/{applicationId} {
        allow read: if request.auth != null && 
                    get(/databases/$(database)/documents/startupListings/$(listingId)).data.founderId == request.auth.uid;
        
        allow read: if request.auth != null && 
                    request.auth.uid == resource.data.userId;
        
        allow create: if request.auth != null && 
                      (request.auth.token.firebase.sign_in_provider == "github.com" || 
                       request.auth.token.firebase.sign_in_provider == "google.com");
        
        allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/startupListings/$(listingId)).data.founderId == request.auth.uid;
      }
    }

    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.recipientId || 
         request.auth.uid == resource.data.founderId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.recipientId || 
         request.auth.uid == resource.data.founderId);
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Run the development server

```bash
npm run dev
# or
yarn dev
```

The app should now be running on `http://localhost:3000`.

## Usage

1. **For Founders**:
   - Log in using your Google account.
   - Create a listing with your startup idea, including salary, equity share, and any other relevant details.
   - Browse tech co-founders who apply to your listing.
   - Approve the co-founder if you believe they are a good fit.
   - Once approved, the tech co-founder will receive your contact information.

2. **For Tech Co-founders**:
   - Log in using your GitHub account.
   - Browse startup listings and apply to the ones you're interested in.
   - Wait for approval from the founder.
   - Once approved, you’ll receive the founder’s contact details to begin the partnership.

## Technologies Used

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Firebase (for authentication and Firestore database)
- **Authentication**: Google OAuth for founders, GitHub OAuth for tech co-founders

## Contributing

We welcome contributions to FutureCo! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-name`).
6. Create a new Pull Request.
