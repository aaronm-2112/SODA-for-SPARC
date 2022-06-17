# -*- coding: utf-8 -*-

### Import required python modules

from gevent import monkey

monkey.patch_all()

from pennsieve import Pennsieve
from manageDatasets import bf_get_current_user_permission
from utils import get_dataset, get_authenticated_ps
from flask import abort 
import json
from collections import defaultdict



def bf_get_doi(selected_bfaccount, selected_bfdataset):
    """
    Function to get current doi for a selected dataset

    Args:
        selected_bfaccount: name of selected Pennsieve acccount (string)
        selected_bfdataset: name of selected Pennsieve dataset (string)
    Return:
        Current doi or "None"
    """

    print(selected_bfaccount)

    try:
        bf = Pennsieve(selected_bfaccount)
    except Exception as e:
        abort(400, "Error: Please select a valid Pennsieve account")

    try:
        myds = bf.get_dataset(selected_bfdataset)
    except Exception as e:
        abort(400, "Error: Please select a valid Pennsieve dataset")


    role = bf_get_current_user_permission(bf, myds)
    if role not in ["owner", "manager"]:
        abort(403, "Error: You don't have permissions to view/edit DOI for this Pennsieve dataset")

    try:
        selected_dataset_id = myds.id
        doi_status = bf._api._get(f"/datasets/{str(selected_dataset_id)}/doi")
        return {"doi": doi_status["doi"]}
    except Exception as e:
        if "doi" in str(e) and "not found" in str(e):
            return {"doi": "None"}
        else:
            raise e





def bf_reserve_doi(selected_bfaccount, selected_bfdataset):
    """
    Function to reserve doi for a selected dataset

    Args:
        selected_bfaccount: name of selected Pennsieve acccount (string)
        selected_bfdataset: name of selected Pennsieve dataset (string)
    Return:
        Success or error message
    """

    try:
        bf = Pennsieve(selected_bfaccount)
    except Exception as e:
        abort(400, "Error: Please select a valid Pennsieve account")

    try:
        myds = bf.get_dataset(selected_bfdataset)
    except Exception as e:
        abort(400, "Error: Please select a valid Pennsieve dataset")

    
    role = bf_get_current_user_permission(bf, myds)
    if role not in ["owner", "manager"]:
        abort(403, "Error: You don't have permissions to view/edit DOI for this Pennsieve dataset")


    try:
        res = bf_get_doi(selected_bfaccount, selected_bfdataset)
        if res != "None":
            abort(400, "Error: A DOI has already been reserved for this dataset")
    except Exception as e:
        raise e

    try:
        selected_dataset_id = myds.id
        contributors_list = bf._api._get(
            "/datasets/" + str(selected_dataset_id) + "/contributors"
        )
        creators_list = []
        for item in contributors_list:
            creators_list.append(item["firstName"] + " " + item["lastName"])
        jsonfile = {
            "title": selected_bfdataset,
            "creators": creators_list,
        }
        bf._api.datasets._post("/" + str(selected_dataset_id) + "/doi", json=jsonfile)
        return {"message": "Done!"}
    except Exception as e:
        raise e




def bf_get_publishing_status(selected_bfaccount, selected_bfdataset):
    """
    Function to get the review request status and publishing status of a dataset

    Args:
        selected_bfaccount: name of selected Pennsieve acccount (string)
        selected_bfdataset: name of selected Pennsieve dataset (string)
    Return:
        Current reqpusblishing status
    """

    try:
        bf = Pennsieve(selected_bfaccount)
    except Exception as e:
        abort(400, "Error: Please select a valid Pennsieve account")

    try:
        myds = bf.get_dataset(selected_bfdataset)
    except Exception as e:
        abort(400, "Error: Please select a valid Pennsieve dataset")

    try:
        selected_dataset_id = myds.id

        review_request_status = bf._api._get(f"/datasets/{str(selected_dataset_id)}")["publication"]["status"]

        publishing_status = bf._api._get(f"/datasets/{str(selected_dataset_id)}/published")["status"]


        return { 
            "publishing_status": review_request_status, 
            "review_request_status": publishing_status
        }
    except Exception as e:
        raise e



def construct_publication_qs(publication_type, embargo_release_date):
    """
    Function to construct the publication query string. Used in bf_submit_review_dataset.
    """
    return f"?publicationType={publication_type}&embargoReleaseDate={embargo_release_date}" if embargo_release_date else f"?publicationType={publication_type}"


def bf_submit_review_dataset(selected_bfaccount, selected_bfdataset,publication_type, embargo_release_date):
    """
        Function to publish for a selected dataset

        Args:
            selected_bfaccount: name of selected Pennsieve acccount (string)
            selected_bfdataset: name of selected Pennsieve dataset (string)
            publication_type: type of publication (string)
            embargo_release_date: (optional) date at which embargo lifts from dataset after publication
        Return:
            Success or error message
    """

    ps = get_authenticated_ps(selected_bfaccount)

    myds = get_dataset(ps, selected_bfdataset)

    role = bf_get_current_user_permission(ps, myds)

    if role not in ["owner"]:
        abort(403, "You must be dataset owner to send a dataset for review.")

    qs = construct_publication_qs(publication_type, embargo_release_date)

    return ps._api._post(f"/datasets/{myds.id}/publication/request{qs}")


def bf_withdraw_review_dataset(selected_bfaccount, selected_bfdataset):

    try:
        bf = Pennsieve(selected_bfaccount)
    except Exception as e:
        error = "Error: Please select a valid Pennsieve account"
        raise Exception(error)

    try:
        myds = bf.get_dataset(selected_bfdataset)
    except Exception as e:
        error = "Error: Please select a valid Pennsieve dataset"
        raise Exception(error)

    try:
        role = bf_get_current_user_permission(bf, myds)
        if role not in ["owner"]:
            error = "Error: You must be dataset owner to withdraw a dataset from review"
            raise Exception(error)
    except Exception as e:
        raise e

    try:
        selected_dataset_id = myds.id
        withdraw_review = bf._api._post(
            "/datasets/"
            + str(selected_dataset_id)
            + "/publication/cancel?publicationType="
            + "publication"
        )
        return withdraw_review
    except Exception as e:
        raise e


"""
    DEPRECATED

    Function to publish for a selected dataset

    Args:
        selected_bfaccount: name of selected Pennsieve acccount (string)
        selected_bfdataset: name of selected Pennsieve dataset (string)
    Return:
        Success or error message
"""


def bf_publish_dataset(selected_bfaccount, selected_bfdataset):

    try:
        bf = Pennsieve(selected_bfaccount)
    except Exception as e:
        error = "Error: Please select a valid Pennsieve account"
        raise Exception(error)

    try:
        myds = bf.get_dataset(selected_bfdataset)
    except Exception as e:
        error = "Error: Please select a valid Pennsieve dataset"
        raise Exception(error)

    try:
        role = bf_get_current_user_permission(bf, myds)
        if role not in ["owner"]:
            error = "Error: You must be dataset owner to publish a dataset"
            raise Exception(error)
    except Exception as e:
        raise e

    try:
        selected_dataset_id = myds.id
        request_publish = bf._api._post(
            "/datasets/" + str(selected_dataset_id) + "/publish"
        )
        return request_publish["status"]
    except Exception as e:
        raise e




def get_files_excluded_from_publishing(selected_dataset, pennsieve_account):
    """
    Function to get the files excluded from publishing

    Args:
        selected_dataset: name of selected Pennsieve dataset (string)
        pennsieve_account: name of selected Pennsieve account (string)
    Return:
        List of files excluded from publishing
    """

    
    ps = get_authenticated_ps(pennsieve_account)

    myds = get_dataset(ps, selected_dataset)

    ds_id = myds.id

    resp = ps._api._get(f"/datasets/{ds_id}/ignore-files")

    if "ignoreFiles" in resp:
        return {"ignore_files": resp["ignoreFiles"]}
    
    return {"ignore_files": []}




def update_files_excluded_from_publishing(pennsieve_account, selected_dataset, files_excluded_from_publishing):
    """
    Function to update the files excluded from publishing

    Args:
        selected_dataset: name of selected Pennsieve dataset (string)
        pennsieve_account: name of selected Pennsieve account (string)
        files_excluded_from_publishing: list of files excluded from publishing (list)
    Return:
        Success or error message
    """

    ps = get_authenticated_ps(pennsieve_account)

    myds = get_dataset(ps, selected_dataset)

    # for file in files_excluded_from_publishing:
    resp = ps._api._put(f"/datasets/{myds.id}/ignore-files", json={"fileName": {"fileName": "README.txt"}})




METADATA_FILES = [
                  "submission.xlsx", 
                  "code_description.xlsx", 
                  "dataset_description.xlsx", 
                  "outputs_metadata.xlsx", 
                  "inputs_metadata.xlsx", 
                  "CHANGES.txt", 
                  "README.txt", 
                  "samples.xlsx", 
                  "subjects.xlsx"
                  ]


def get_metadata_files(selected_dataset, pennsieve_account):
    """
    Function to get the metadata files

    Args:
        selected_dataset: name of selected Pennsieve dataset (string)
        pennsieve_account: name of selected Pennsieve account (string)
    Return:
        List of metadata files
    """

    ps = get_authenticated_ps(pennsieve_account)

    myds = get_dataset(ps, selected_dataset)

    resp = ps._api._get(f"/datasets/{myds.id}")

    if "children" not in resp:
        return {"metadata_files": []}

    children = resp["children"]

    # iterate through children check if content property has name property that equals one of the valid metadata file names and return it if so
    return {
        "metadata_files": [child["content"]["name"] for child in children if "content" in child and "name" in child["content"] and child["content"]["name"] in METADATA_FILES]
    }
