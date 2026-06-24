#!/bin/bash
set -e

echo "=== Bluetooth Web Tester Deployment Script ==="
echo "Checking and installing system dependencies..."
sudo apt-get update
sudo apt-get install -y python3-venv python3-pip bluez libglib2.0-dev

WORKDIR=$(pwd)
CURRENT_USER=$(id -un)
CURRENT_GROUP=$(id -gn)

echo "Setting up Python virtual environment in $WORKDIR..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "Configuring Systemd service..."
# Ensure the user is in the bluetooth group to access hci devices without root
sudo usermod -a -G bluetooth $CURRENT_USER

SERVICE_FILE="/tmp/ble-tester.service.tmp"
cp deploy/ble-tester.service $SERVICE_FILE

sed -i "s|{{WORKDIR}}|$WORKDIR|g" $SERVICE_FILE
sed -i "s|{{USER}}|$CURRENT_USER|g" $SERVICE_FILE
sed -i "s|{{GROUP}}|$CURRENT_GROUP|g" $SERVICE_FILE

sudo mv $SERVICE_FILE /etc/systemd/system/ble-tester.service
sudo chmod 644 /etc/systemd/system/ble-tester.service

echo "Reloading systemd and enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable ble-tester.service
sudo systemctl restart ble-tester.service

echo "=== Deployment Complete ==="
echo "Service status:"
sudo systemctl status ble-tester.service --no-pager | head -n 10 || true
echo ""
echo "You can now access the interface at: http://<your_device_ip>:8000"
