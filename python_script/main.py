import base64
import cv2
import numpy as np
from deepface import DeepFace
import mediapipe as mp
from collections import defaultdict
from datetime import datetime
import socketio

# Initialize the camera
camera = cv2.VideoCapture(0)

# Initialize the face cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Initialize MediaPipe Hands
mpHands = mp.solutions.hands
hands = mpHands.Hands(max_num_hands=2, min_detection_confidence=0.7)
mpDraw = mp.solutions.drawing_utils

# Initialize dictionary to store unique faces and their gender
face_data = defaultdict(dict)

# Initialize the WebSocket client
sio = socketio.Client()
sio.connect('http://localhost:5001') 

while True:
    ret, frame = camera.read()
    if not ret:
        print("Failed to grab frame")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    # Initialize lists to keep track of coordinates of men and women
    men_coords = []
    women_coords = []

    woman_surrounded = False
    lone_woman_at_night = False

    for (x, y, w, h) in faces:
        face = frame[y:y+h, x:x+w]
        face_rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)

        face_id = str(hash(tuple(face_rgb.flatten())))

        if face_id not in face_data:
            try:
                result = DeepFace.analyze(face_rgb, actions=['gender'], enforce_detection=False)

                if isinstance(result, list):
                    result = result[0]

                dominant_gender = result['dominant_gender']
                gender_confidence = result['gender'][dominant_gender]

                if gender_confidence > 0.80:
                    face_data[face_id] = {'gender': dominant_gender, 'counted': False}

            except Exception as e:
                print(f"Error: {str(e)}")

        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

        if face_data[face_id]['gender'] == 'Man':
            cv2.putText(frame, 'Man', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            men_coords.append((x, y, w, h))
        else:
            cv2.putText(frame, 'Woman', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            women_coords.append((x, y, w, h))

    male_count = sum(1 for face in face_data.values() if face['gender'] == 'Man' and not face['counted'])
    female_count = sum(1 for face in face_data.values() if face['gender'] == 'Woman' and not face['counted'])

    for face in face_data.values():
        face['counted'] = True

    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(frame, f'Men: {male_count}', (10, 30), font, 1, (255, 0, 0), 2, cv2.LINE_AA)
    cv2.putText(frame, f'Women: {female_count}', (10, 70), font, 1, (0, 255, 0), 2, cv2.LINE_AA)

    for wx, wy, ww, wh in women_coords:
        nearby_men = 0
        for mx, my, mw, mh in men_coords:
            if abs(mx - wx) < ww and abs(my - wy) < wh:
                nearby_men += 1
        if nearby_men >= 3:
            woman_surrounded = True
            cv2.putText(frame, 'Woman Surrounded!', (wx, wy-50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

    current_hour = datetime.now().hour
    if 19 <= current_hour <= 5 and female_count == 1 and male_count == 0:
        lone_woman_at_night = True
        for wx, wy, ww, wh in women_coords:
            cv2.putText(frame, 'Lone Woman Detected at Night!', (wx, wy-50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    sos_detected = False

    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            mpDraw.draw_landmarks(frame, handLms, mpHands.HAND_CONNECTIONS)

            thumb_tip = handLms.landmark[mpHands.HandLandmark.THUMB_TIP]
            index_finger_tip = handLms.landmark[mpHands.HandLandmark.INDEX_FINGER_TIP]

            if thumb_tip.y < index_finger_tip.y:
                sos_detected = True

    cv2.putText(frame, f'SOS Detected: {"True" if sos_detected else "False"}', (10, 110), font, 1, (0, 0, 255) if sos_detected else (0, 255, 0), 2, cv2.LINE_AA)
    cv2.putText(frame, f'Woman Surrounded: {"True" if woman_surrounded else "False"}', (10, 150), font, 1, (0, 0, 255) if woman_surrounded else (0, 255, 0), 2, cv2.LINE_AA)
    cv2.putText(frame, f'Lone Woman at Night: {"True" if lone_woman_at_night else "False"}', (10, 190), font, 1, (0, 0, 255) if lone_woman_at_night else (0, 255, 0), 2, cv2.LINE_AA)

    
    _, buffer = cv2.imencode('.jpg', frame)
    # Convert JPEG bytes to Base64
    frame_base64 = base64.b64encode(buffer).decode('utf-8')

    sio.emit('info', {
        'image': frame_base64,
        'male_count': male_count,
        'female_count': female_count,
        'sos_detected': sos_detected,
        'woman_surrounded': woman_surrounded,
        'lone_woman_at_night': lone_woman_at_night
    })

    cv2.imshow('Frame', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

camera.release()
cv2.destroyAllWindows()