# CampusHub Integrated

CampusHub Integrated is a comprehensive mobile application designed for King Salman International University (KSIU). It streamlines campus life by enabling students and staff to book facilities and classrooms, submit complaints, order food from the food court, and interact seamlessly with both administrative staff and peers. The app provides personalized profiles for students and administration, fostering a connected and efficient campus environment.

## Features

- **Facility & Classroom Booking:** Easily reserve spaces for study, meetings, or activities.
- **Complaint System:** Submit and track campus-related complaints.
- **Food Court Ordering:** Order food directly from the campus food court.
- **Student-Staff Integration:** Connect students with staff and administration for better support.
- **Personalized Profiles:** Distinct profiles for students and administrative personnel.

## Tech Stack

- **Framework:** React Native
- **Platforms:** Android, iOS

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (Recommended: v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for easier React Native development)
- Git

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Ziad-Fahmy/campushub_integrated.git
   cd campushub_integrated
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the App (Expo)**
   ```bash
   npx expo start
   ```

   - Use the Expo Go app on your mobile device to scan the QR code and run the app instantly.
   - Or run on an emulator/simulator:
     ```bash
     npx expo run:android
     npx expo run:ios
     ```

### Environment Variables

If the app uses any environment variables (API URLs, keys, etc.), create a `.env` file in the root and add relevant variables as instructed in the codebase.

### Directory Structure

```
campushub_integrated/
├── assets/           # Images, fonts, etc.
├── components/       # Reusable React Native components
├── navigation/       # Navigation-related files
├── screens/          # App screens
├── services/         # API and business logic
├── App.js            # App entry point
├── package.json
└── ...
```

## Contributing

We welcome contributions! Please fork the repository and submit a pull request. For major changes, open an issue first to discuss your proposed changes.

## Maintainers

- [Ziad Fahmy](https://github.com/Ziad-Fahmy)

## License

This project is licensed under the MIT License.

---

> Made with ❤️ for the KSIU community.
