import json
from PIL import Image, ImageChops

def remove_overlapping_elements(landing_image_path, element_image_path, output_image_path, element_coords):
    landing_image = Image.open('/Users/tejachava/RA/snapshot_testing/element_Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.53 Safari/537.36_0.png')
    element_image = Image.open('/Users/tejachava/RA/snapshot_testing/landing_Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.53 Safari/537.36_1.png')

    # Create a blank image with the same size as the landing image
    blank_image = Image.new('RGBA', landing_image.size, (0, 0, 0, 0))

    # Paste the element image onto the blank image at the specified coordinates
    blank_image.paste(element_image, element_coords)

    # Subtract the element image from the landing image
    result_image = ImageChops.subtract(landing_image, blank_image)

    # Save the resulting image
    result_image.save(output_image_path)

def process_images(device_name):
    # Load the bounding box information from the JSON file
    with open(f'bounding_boxes_{device_name}.json', 'r') as f:
        bounding_boxes = json.load(f)

    for index, bounding_box_info in enumerate(bounding_boxes):
        landing_image_path = f'landing_{device_name}_{index}.png'
        element_image_path = f'element_{device_name}_{index}.png'
        output_image_path = f'output_{device_name}_{index}.png'

        element_coords = (int(bounding_box_info['bounding_box']['x']), int(bounding_box_info['bounding_box']['y']))

        remove_overlapping_elements(landing_image_path, element_image_path, output_image_path, element_coords)

# Example usage
process_images('Desktop Chrome')

