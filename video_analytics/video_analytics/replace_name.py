import os
import re

def replace_in_folder(folder_path):
    excludes = ['node_modules', '.git', '__pycache__', 'venv', 'env', '.env', '.idea', 'build', 'dist']
    
    # We want to replace exactly EyeSpot with EyeSpot
    # And eyespot with eyespot
    replacements = {
        r'\bEyeSpot\b': 'EyeSpot',
        r'\beyespot\b': 'eyespot'
    }

    replaced_files = []

    for root, dirs, files in os.walk(folder_path):
        dirs[:] = [d for d in dirs if d not in excludes]
        
        for file in files:
            # exclude some binary files or noisy files if needed, but let's try opening as utf-8
            if file.endswith('.pyc') or file.endswith('.png') or file.endswith('.jpg') or file.endswith('.pt') or file.endswith('.mp4'):
                continue
                
            filepath = os.path.join(root, file)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                new_content = content
                for pattern, repl in replacements.items():
                    new_content = re.sub(pattern, repl, new_content)
                
                # also catch cases like EyeSpotVideoAnalytics
                new_content = new_content.replace('EyeSpot', 'EyeSpot').replace('eyespot', 'eyespot')
                    
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    replaced_files.append(filepath)
            except Exception as e:
                # likely a binary file or encoding issue
                pass

    print(f"Replaced text in {len(replaced_files)} files.")
    for f in replaced_files:
        print("Updated:", f)

if __name__ == '__main__':
    project_path = r"c:\Users\vrajr\Downloads\video_analytics (2)\video_analytics\video_analytics"
    replace_in_folder(project_path)
