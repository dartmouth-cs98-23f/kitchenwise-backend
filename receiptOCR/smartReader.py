import cv2
from PIL import Image
import numpy as np
import pillow_heif
import requests
import tempfile
import json
import io
import base64
import os
import sys
from dotenv import load_dotenv

# OPENAI KEY from environment


def convert_image(input_path):

    image = cv2.imread(input_path)

    if image is None or image.size == 0:
        # Check if the file is a HEIC file
        if input_path.lower().endswith(".heic"):
            # Use pillow_heif to open HEIC files
            image = pillow_heif.read_heif(
                input_path, convert_hdr_to_8bit=False, bgr_mode=False
            )
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
    alpha = contrastAlpha  # Contrast control
    beta = brightnessBeta  # Brightness control

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


# Function to encode the image
def encode_image(image_path):
    # We must convert the cv2 file into a file type.
    # Encode the image to a memory buffer as PNG
    success, buffer = cv2.imencode(".png", image_path)

    if not success:
        print("Could not encode image.")
    else:
        # Convert the buffer to a BytesIO file-like object
        image_file_like = io.BytesIO(buffer)

    # Reset the pointer of the BytesIO object to the beginning
    image_file_like.seek(0)

    # Create a temporary file and write the BytesIO content to it
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
        tmp_file.write(image_file_like.getvalue())
        tmp_file_path = tmp_file.name

    with open(tmp_file_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


# OpenAI API
def visionAPI(base64_image):

    # Load environment variables from .env file
    load_dotenv()

    # Access the OpenAI API key from environment variables
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}",
    }

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What are the food items and quantities in this receipt? Combine multiple quantities if needed. Get units if possible. Return a dictionary. Do not include explanations or comments.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
        "max_tokens": 300,
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )

    return response.json()


# Results
def parseData(filename):

    # Process the image first
    imagefile = imageProcessor(filename)

    # Encode the image into base64 so the API can read it
    base64_image = encode_image(imagefile)

    # Pass the image into the vision API
    vision = visionAPI(base64_image)

    # Extracting the 'content' field from the first item in 'choices'
    content_str = vision["choices"][0]["message"]["content"]

    content_str = content_str.strip()

    # Check and remove Markdown JSON or Python code block markers
    if content_str.startswith("```json"):
        # Remove the starting ```json
        content_str = content_str[7:]
    elif content_str.startswith("```python"):
        # Remove the starting ```python
        content_str = content_str[9:]
    if content_str.endswith("```"):
        # Remove the ending ```
        content_str = content_str[:-3]

    # Now strip any leading or trailing whitespace that might be left after removing markers
    content_str = content_str.strip()

    items_dict = {}
    try:
        items_dict = json.loads(content_str)
    except json.decoder.JSONDecodeError as e:
        print("Error decoding JSON:", e)
        print("Content causing error:", content_str)

    # Return the dictionary
    return items_dict


def writeItemDict(dict, image_uri):
    json_string = json.dumps(dict)
    json_uri = image_uri.split(".")[0] + ".json"
    f = open(json_uri, "x")
    f.write(json_string)
    f.close()
    return json_uri


def main(argv):
    if len(argv) != 2:
        print("Usage: `python ./smartReader.py <image_uri>")
        return 1
    image_uri = argv[1]
    items_dict = parseData(image_uri)
    if (not items_dict) or len(items_dict) == 0:
        sys.stderr.write("No items could be extracted")
        return 1
    json_uri = writeItemDict(items_dict, image_uri)
    sys.stdout.write(json_uri)
    return 0


if __name__ == "__main__":
    main(sys.argv)
