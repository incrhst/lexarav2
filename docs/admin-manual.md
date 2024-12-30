# IP Management System - Administrator Manual

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [System Configuration](#system-configuration)
3. [User Management](#user-management)
4. [Application Management](#application-management)
5. [Demo Mode](#demo-mode)
6. [Security](#security)
7. [Troubleshooting](#troubleshooting)

## Initial Setup

### Creating the First Admin User

1. **Register a Regular Account**
   - Visit the application's registration page
   - Create a new account with your email and password
   - Note: This will create a regular user account initially

2. **Promote to Admin**
   - Connect to your Supabase database
   - Run the following SQL command:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE id = '<your-user-id>';
   ```
   - To find your user ID, check:
     - Supabase Dashboard > Authentication > Users
     - Or run: `SELECT * FROM auth.users WHERE email = 'your.email@example.com';`

3. **Verify Admin Access**
   - Log out and log back in
   - You should now see the Admin Dashboard at `/admin`
   - Your role indicator should show "Administrator"

### Quick Start Guide

1. **Post-Setup Tasks**
   - Change your password
   - Create additional admin accounts if needed
   - Configure system settings
   - Set up demo mode (if required)

2. **Essential Configurations**
   - Review security settings
   - Set up email notifications
   - Configure application workflows
   - Set default values

## System Configuration

### General Settings
- System preferences
- Email templates
- Notification settings
- Default values
- Regional settings

### Security Settings
- Password policies
- Session timeouts
- Access controls
- API configurations

## User Management

### User Roles
- **Admin**: Full system access
- **Processor**: Can process applications
- **Applicant**: Can submit applications
- **Public**: Limited access

### Managing Users
- View all users
- Edit user details
- Change user roles
- Disable/enable accounts

## Application Management

### Processing Applications
- Review submissions
- Update status
- Add notes
- Manage oppositions

### Workflow Configuration
- Status definitions
- Processing rules
- Automation settings
- Notification triggers

## Demo Mode

### Overview
Demo mode provides a safe environment for:
- Testing features
- Training users
- Demonstrations
- Evaluation

### Managing Demo Mode

#### Enabling Demo Mode
1. Navigate to Admin Dashboard
2. Click "Enable Demo Mode"
3. System will create:
   ```
   Demo User Account:
   - Email: demo.user@example.com
   - Role: Applicant

   Demo Admin Account:
   - Email: demo.admin@example.com
   - Role: Administrator

   Demo Processor Account:
   - Email: demo.processor@example.com
   - Role: Processor

   Default Password: Demo123!@#
   ```

#### Demo Features
- Sample applications
- Test data
- Simulated workflows
- Safe testing environment

#### Security Notes
- Demo accounts are isolated
- Real data is protected
- Demo actions are logged
- Access controls remain enforced

#### Disabling Demo Mode
1. Click "Disable Demo Mode"
2. System will:
   - Remove demo accounts
   - Delete test data
   - Preserve real data

### Best Practices
1. **Security**
   - Change default demo passwords
   - Monitor demo usage
   - Regular cleanup
   - Review access logs

2. **Usage**
   - Training purposes
   - Feature testing
   - Demonstrations
   - Evaluation

## Security

### Access Control
- Role-based permissions
- IP restrictions
- Session management
- Audit logging

### Data Protection
- Encryption
- Backups
- Data retention
- Privacy compliance

## Troubleshooting

### Common Issues
- Login problems
- Permission errors
- Processing issues
- System errors

### Support
- Technical documentation
- Error logs
- Contact information
- Escalation procedures

---

For technical support, contact: support@ipmanager.com