import json
import unittest
from app import create_app
from app.extensions import db
from app.models.sensor import SensorReading

class SilkwormApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_root_health(self):
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'online')

    def test_sensor_ingestion_optimal(self):
        payload = {
            "temperature": 26.5,
            "humidity": 78.0,
            "soil_moisture": 50.0,
            "gas_value": 450.0,
            "ldr_value": 400.0
        }
        res = self.client.post('/api/v1/sensors/data', 
                               data=json.dumps(payload), 
                               content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['buzzer'], False) # Optimal = buzzer OFF
        self.assertEqual(data['entry']['is_healthy'], True)
        self.assertEqual(data['entry']['severity'], 0)

    def test_sensor_ingestion_alert_and_recommendations(self):
        # High heat + dry air -> should trigger buzzer and smart recommendations
        payload = {
            "temperature": 32.0,
            "humidity": 60.0,
            "soil_moisture": 20.0,
            "gas_value": 1800.0,
            "ldr_value": 900.0
        }
        res = self.client.post('/api/data', # Testing legacy endpoint alias!
                               data=json.dumps(payload), 
                               content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data['buzzer'], True) # Alert = buzzer ON
        self.assertEqual(data['entry']['is_healthy'], False)
        self.assertGreaterEqual(len(data['entry']['warnings']), 3)
        self.assertGreaterEqual(len(data['entry']['recommendations']), 3)

    def test_latest_endpoint(self):
        self.client.post('/api/data', data=json.dumps({
            "temperature": 25.0, "humidity": 75.0, "soil_moisture": 50.0,
            "gas_value": 500.0, "ldr_value": 350.0
        }), content_type='application/json')

        res = self.client.get('/api/latest')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['has_data'])
        self.assertEqual(data['temperature'], 25.0)

    def test_history_and_analytics(self):
        # Add 3 readings
        for i in range(3):
            self.client.post('/api/data', data=json.dumps({
                "temperature": 25.0 + i, "humidity": 75.0, "soil_moisture": 50.0,
                "gas_value": 500.0, "ldr_value": 350.0
            }), content_type='application/json')

        res = self.client.get('/api/history?per_page=10')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['total_records'], 3)
        self.assertEqual(len(data['items']), 3)

        summary_res = self.client.get('/api/summary')
        self.assertEqual(summary_res.status_code, 200)
        summary_data = summary_res.get_json()
        self.assertEqual(summary_data['total_records'], 3)

    def test_invalid_payload_validation(self):
        # Invalid temperature (outside physical bounds)
        res = self.client.post('/api/data', data=json.dumps({
            "temperature": 999.0, "humidity": 75.0
        }), content_type='application/json')
        self.assertEqual(res.status_code, 422)

if __name__ == '__main__':
    unittest.main()

