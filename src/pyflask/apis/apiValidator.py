from flask_restx import Resource
from validator import validate_local_dataset, validate_dataset_pipeline
from namespaces import get_namespace, NamespaceEnum

# get the namespace for the validator 
api = get_namespace(NamespaceEnum.VALIDATE_DATASET)



@api.route('/local_dataset_validation_result')
class ValidateLocalDataset(Resource):

    parser = api.parser()
    parser.add_argument('path', type=str, required=True, help='Path to the target local dataset')

    @api.expect(parser)
    @api.doc(responses={500: 'Internal Server Error', 400: 'Bad Request', 200: 'OK'})
    def get(self):
        # get the path from the request object
        path = self.parser.parse_args()['path']
        api.logger.info(f' /local_dataset_validation_result --  args -- path: {path}')

        try:
            return validate_local_dataset(path)
        except Exception as e:
            api.abort(500, str(e))



@api.route('/pennsieve_dataset_validation_result')
class ValidatePennsieveDataset(Resource):
    parser = api.parser()
    parser.add_argument('dataset_name_or_path', type=str, required=True, help='Dataset identifier can be name or UUID')

    @api.expect(parser)
    @api.doc(responses={500: 'Internal Server Error', 400: 'Bad Request', 200: 'OK'})
    def get(self):
        # get the path from the request object
        dname = self.parser.parse_args()['path']
        api.logger.info(f' /local_dataset_validation_result --  args -- path: {dname}')

        try:
            return validate_dataset_pipeline(dname)
        except Exception as e:
            api.abort(500, str(e))