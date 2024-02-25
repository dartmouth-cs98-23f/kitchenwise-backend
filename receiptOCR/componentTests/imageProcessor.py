import matplotlib.pyplot as plt
import cv2
from PIL import Image
import numpy as np
import pillow_heif


# HEIC Support
# Greyscale
# Contrast & Brightening
# Convert to RGB


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


def show(file_path):
    image = imageProcessor(file_path)
    plt.imshow(image)
    plt.xticks([]), plt.yticks([])  # to hide tick values on X and Y axis
    plt.show()


# Testing
file_path1 = 'exampleheic.heic'
file_path2 = 'examplejpg.jpg'
file_path3 = 'images/grocery-receipt-3.jpg'
# show(file_path3)

# Saving
# cv2.imwrite('test1.png', imageProcessor(file_path1))
# cv2.imwrite('test2.png', imageProcessor(file_path2))
cv2.imwrite('test3.png', imageProcessor(file_path3))
