from pennsieve2 import Pennsieve
import re
import math



class UploadManifestSession:

    # properties 
    df_mid = None
    ps = None

    # upload values 
    main_total_generate_dataset_size = None
    total_files_to_upload = None 
    elapsed_time = None

    def __init__(self):
        self.df_mid = None

    def set_df_mid(self, id):
        self.df_mid = id
    
    def get_df_mid(self):
        return self.df_mid
    
    def set_elapsed_time(self, time):
        self.elapsed_time = time

    def get_elapsed_time(self):
        return self.elapsed_time
    
    def set_main_total_generate_dataset_size(self, size):
        self.main_total_generate_dataset_size = size

    def get_main_total_generate_dataset_size(self):
        return self.main_total_generate_dataset_size
    
    def set_total_files_to_upload(self, count):
        self.total_files_to_upload = count

    def get_total_files_to_upload(self):
        return self.total_files_to_upload

    def df_mid_has_progress(self):
        return self.manifest_has_progress(self.df_mid)
    
    def get_remaining_file_count(self, mid, total_files):
        if self.ps is None:
            self.ps = Pennsieve()
        total_pages = math.ceil(total_files / 1000)
        remaining_files = 0
        offset = 0
        for i in range(total_pages):
            if i >= 1:
                offset += 1000
            file_page = self.ps.manifest.list_files(mid, offset , 1000)
            # if there is no node_id then an upload hasn't started yet - all files are remaining 
            # regular expression that searches and counts for every string that has "status: LOCAL" or "status: REGISTERED" in the string
            remaining_files +=  len(re.findall(r'status: REGISTERED|status: LOCAL' , str(file_page)))
        return remaining_files
    
    def create_obj_from_string(self,s):
        # Split into individual objects
        objects = re.findall(r'file {([^}]*?)}', s, re.DOTALL)

        # Parse each object
        parsed_objects = []
        for obj in objects:
            # Split into lines and remove empty lines
            lines = [line.strip() for line in obj.split('\n') if line.strip()]
            # Split each line into key and value and create a dictionary
            parsed_object = {line.split(': ')[0]: line.split(': ')[1] for line in lines}
            parsed_objects.append(parsed_object)

        return parsed_objects

    def calculate_completed_upload_size(self, mid, bytes_per_file_dict, total_files):
        if self.ps is None:
            self.ps = Pennsieve()
        total_pages = math.ceil(total_files / 1000)
        offset = 0
        total_bytes_uploaded = 0
        for i in range(total_pages):
            if i >= 1:
                offset += 1000
            file_string = self.ps.manifest.list_files(mid, offset , 1000)
            parsed_objects = self.create_obj_from_string(str(file_string))
            for obj in parsed_objects:
                if 'status' not in obj:
                    total_bytes_uploaded += 0
                if obj['status'] == 'UPLOADED' or obj['status'] == 'IMPORTED' or obj['status'] == 'FINALIZED' or obj['status'] == 'VERIFIED':
                    file_path = obj['source_path']
                    # remove the first and last characer of file_path - these are quotation marks
                    file_path = file_path[1:-1]
                    total_bytes_uploaded += int(bytes_per_file_dict.get(file_path, 0))

        return total_bytes_uploaded

    




