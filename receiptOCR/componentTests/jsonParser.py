import json

# Sample JSON response
json_response = {
    "id": "chatcmpl-8vcHjbAaiE04eWdXKaMGyviogqQLa",
    "object": "chat.completion",
    "created": 1708742555,
    "model": "gpt-4-1106-vision-preview",
    "usage": {
        "prompt_tokens": 465,
        "completion_tokens": 202,
        "total_tokens": 667
    },
    "choices": [{
        "message": {
            "role": "assistant",
            "content": """
{
    "9 GRAIN BREAD": "1 unit",
    "HONEY CURED HAM": "2.54",
    "TURKEY": "7.06",
    "DAN 8PK ACTIVA ST/BL": "4.49",
    "EGGLND LG WHT EGG": "3.59",
    "ANG TOP RD LND BRL": "5.49",
    "GALA APPLES": "4.80 lb",
    "BANANAS": "2.18 lb",
    "GREEN CUCUMBERS": "2 unit",
    "BULK GARLIC": "0.49",
    "RED TOMATOES ON VINE": "1.33 lb",
    "YELLOW ONIONS": "1.63 lb",
    "GREEN BELL PEPPERS": "0.63 lb",
    "FRESH TILAPIA FILLET": "4.13"
}
"""
        },
        "finish_reason": "stop",
        "index": 0
    }]
}

# Extracting the 'content' field from the first item in 'choices'
content_str = json_response['choices'][0]['message']['content']

# Converting the string in 'content' to a dictionary
items_dict = json.loads(content_str)

print(items_dict)
