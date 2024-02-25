import cv2
from PIL import Image
import numpy as np
import pillow_heif
import requests
import tempfile
import json
import io
import re


def convert_image(input_path):
    
    image = cv2.imread(input_path)

    if image is None or image.size == 0:
        # Check if the file is a HEIC file
        if input_path.lower().endswith('.heic'):
            # Use pillow_heif to open HEIC files
            image = pillow_heif.read_heif(input_path, convert_hdr_to_8bit=False, bgr_mode=False)
        else:
            print("Error: Image Type Not Supported.")
            quit()
    else:
        # For other image formats, use Pillow directly
        image = Image.open(input_path)
    
    open_cv_image = np.array(image)
    open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)
    
    # Return image as a BGR file
    return open_cv_image


def BGRtoRGB(imageFile):
    # Mostly obsolete but useful function to have
    im2 = imageFile.copy()
    im2[:, :, 0] = imageFile[:, :, 2]
    im2[:, :, 2] = imageFile[:, :, 0]

    return im2


def greyScale(imageFile):

    im_gray = cv2.cvtColor(imageFile, cv2.COLOR_BGR2GRAY)

    # Gaussian + Adaptive Binary Imaging Technique--works well if works, works terribly otherwise
    # img = cv2.medianBlur(imageFile, 5)
    # th3 = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

    return im_gray


def sharpenContrast(imageFile, contrastAlpha=1.05, brightnessBeta=3):
    # Define alpha and beta for contrast and brightness
    alpha = contrastAlpha # Contrast control
    beta = brightnessBeta # Brightness control

    # Call convertScaleAbs function to adjust contrast and brightness
    adjusted = cv2.convertScaleAbs(imageFile, alpha=alpha, beta=beta)

    return adjusted


def imageProcessor(imageFile):

    # Converts the image into a usable format
    image = convert_image(imageFile)

    # Greyscales it
    image = greyScale(image)
    
    # Sharpens blacks and whites for easier reading
    image = sharpenContrast(image)

    # Check
    if image is None or image.size == 0:
        print("Error: Image not loaded.")
        quit()
    #

    # Returns a RGB image
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


# API
# The api key is free to get, so just sign up on ocr space to get yours.
def ocr_space_file(filename, overlay=False, api_key='K85707808888957', language='eng'):
    """ OCR.space API request with local file.
    :param filename: Your file path & name.
    :param overlay: Is OCR.space overlay required in your response.
                    Defaults to False.
    :param api_key: OCR.space API key.
                    Defaults to 'helloworld'.
    :param language: Language code to be used in OCR.
                    List of available language codes can be found on https://ocr.space/OCRAPI
                    Defaults to 'en'.
    :return: Result in JSON format.
    """

    payload = {'isOverlayRequired': False,
               'apikey': api_key,
               'detectOrientation': True,               
               'scale': True,
               'isTable': True,
               'OCREngine': 2,
               'language': language,
               }
    
    with open(filename, 'rb') as f:
        r = requests.post('https://api.ocr.space/parse/image',
                          files={filename: f},
                          data=payload,
                          )
        
    return r.content.decode()

# Results
def parseData(filename):

    imagefile = imageProcessor(filename)

    # We must convert the cv2 file into a file type.
    # Encode the image to a memory buffer as PNG
    success, buffer = cv2.imencode('.png', imagefile)

    if not success:
        print("Could not encode image.")
    else:
        # Convert the buffer to a BytesIO file-like object
        image_file_like = io.BytesIO(buffer)
    
    # Reset the pointer of the BytesIO object to the beginning
    image_file_like.seek(0)

    # Create a temporary file and write the BytesIO content to it
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
        tmp_file.write(image_file_like.getvalue())
        tmp_file_path = tmp_file.name

    # Pass it into the API
    filename = ocr_space_file(tmp_file_path)

    try:
        data = json.loads(filename)
    except json.JSONDecodeError as e:
        print(f"Error occurred: {e}")

    result = data['ParsedResults'][0]['ParsedText']

    # Split on any combination of \t, \r, and \n characters
    # This also filters out empty strings automatically
    words = re.split(r'[\t\r\n]+', result)

    # Filter out words that begin with a digit
    filtered_words = [word for word in words if word and not word[0].isdigit()]

    # Count occurrences of each word in a dictionary
    word_counts = {}
    for word in filtered_words:
        if word in word_counts:
            word_counts[word] += 1
        else:
            word_counts[word] = 1

    # The word_counts dictionary now contains the words (excluding those that begin with a digit) as keys,
    # and the number of occurrences as values.
    return(word_counts)
