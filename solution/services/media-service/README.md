- in terminal run:
python -m venv venv
source venv/bin/activate 	// linux
> venv/Scripts/activate		// win
> pip install -r requirements.txt

- run service (from root folder):
> uvicorn app.main:app --port 8010 --reload


----------------------------------------
naming conventions:
General Principles:
- Readability: Names should be clear and descriptive.
- Consistency: Adhere to a chosen style throughout your project.

Specific Conventions:
- Modules and Packages: Use lowercase letters with underscores (e.g., my_module.py, my_package).
- Functions and Variables: Use lowercase letters with underscores (snake_case) (e.g., calculate_total, user_name).
- Classes: Use CapWords (CamelCase) where the first letter of each word is capitalized, and there are no underscores (e.g., MyClass, HTTPClient).
- Methods: Follow the same convention as functions (snake_case) (e.g., get_data, process_input).
- Constants: Use uppercase letters with underscores (UPPER_CASE_WITH_UNDERSCORES) (e.g., MAX_RETRIES, DEFAULT_TIMEOUT).
- Private Variables/Methods: Prefix with a single underscore to indicate they are intended for internal use (e.g., _private_variable, _internal_method).
- Dunder Methods (Magic Methods): Use double underscores at the beginning and end (e.g., __init__, __str__).
- Boolean Variables: Often start with is_, has_, or can_ (e.g., is_active, has_permission).

Avoid:
- Single-character names (except for loop counters like i, j).
- Using Python keywords as names.
- Starting names with digits. 