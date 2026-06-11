import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]

def calculate_ear(eye_landmarks, frame_width, frame_height):
    # Euclidean distances
    p2_p6 = np.linalg.norm(np.array([eye_landmarks[1].x * frame_width, eye_landmarks[1].y * frame_height]) - 
                           np.array([eye_landmarks[5].x * frame_width, eye_landmarks[5].y * frame_height]))
    p3_p5 = np.linalg.norm(np.array([eye_landmarks[2].x * frame_width, eye_landmarks[2].y * frame_height]) - 
                           np.array([eye_landmarks[4].x * frame_width, eye_landmarks[4].y * frame_height]))
    p1_p4 = np.linalg.norm(np.array([eye_landmarks[0].x * frame_width, eye_landmarks[0].y * frame_height]) - 
                           np.array([eye_landmarks[3].x * frame_width, eye_landmarks[3].y * frame_height]))
    
    if p1_p4 == 0:
        return 0.0
    ear = (p2_p6 + p3_p5) / (2.0 * p1_p4)
    return ear

def process_frame_for_blink(image_array):
    rgb_image = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_image)
    
    if results.multi_face_landmarks:
        h, w, _ = image_array.shape
        landmarks = results.multi_face_landmarks[0].landmark
        
        left_eye_points = [landmarks[i] for i in LEFT_EYE]
        right_eye_points = [landmarks[i] for i in RIGHT_EYE]
        
        left_ear = calculate_ear(left_eye_points, w, h)
        right_ear = calculate_ear(right_eye_points, w, h)
        
        avg_ear = (left_ear + right_ear) / 2.0
        
        # Get face bounding box for UI drawing
        x_min = min([lm.x for lm in landmarks]) * w
        y_min = min([lm.y for lm in landmarks]) * h
        x_max = max([lm.x for lm in landmarks]) * w
        y_max = max([lm.y for lm in landmarks]) * h
        
        return {
            "ear": avg_ear,
            "face_box": {"x": int(x_min), "y": int(y_min), "w": int(x_max - x_min), "h": int(y_max - y_min)}
        }
    return None
