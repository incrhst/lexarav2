# IP Management System - Deployment & System Administration Manual

## System Requirements

### Production Environment
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Supabase account
- Netlify account for hosting

### Development Environment
- Git
- Node.js 18.x or higher
- npm 8.x or higher
- Modern web browser

## Initial Deployment

### 1. Supabase Setup

1. **Create Project**
   ```bash
   # Create new Supabase project through dashboard
   # Note the project URL and anon key
   ```

2. **Database Initialization**
   - Run migrations in order:
   ```sql
   -- Execute migrations in sequence
   0001_ancient_math.sql
   0002_muddy_violet.sql
   0003_velvet_truth.sql
   0004_steep_night.sql
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file with Supabase credentials
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 2. Application Deployment

1. **Build Application**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect repository to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables from `.env`

### 3. First Admin Setup

1. **Create Initial Admin**
   ```sql
   -- First, register a normal account through the UI
   -- Then, execute in Supabase SQL editor:
   UPDATE profiles
   SET role = 'admin'
   WHERE id = '<user-id>';
   ```

2. **Verify Admin Access**
   - Log out and log back in
   - Confirm access to `/admin` route
   - Check admin capabilities

## System Administration

### Database Management

1. **Backup Schedule**
   ```sql
   -- Enable point-in-time recovery
   -- Configure daily backups
   -- Test restore procedures
   ```

2. **Performance Monitoring**
   ```sql
   -- Monitor slow queries
   SELECT * FROM pg_stat_statements
   ORDER BY total_time DESC
   LIMIT 10;
   ```

3. **Index Maintenance**
   ```sql
   -- Analyze index usage
   SELECT * FROM pg_stat_user_indexes;
   ```

### Security Management

1. **Row Level Security (RLS)**
   ```sql
   -- Verify RLS policies
   SELECT * FROM pg_policies;
   ```

2. **API Security**
   - Regularly rotate anon key
   - Monitor API usage
   - Set up rate limiting

3. **Access Control**
   ```sql
   -- Review admin accounts
   SELECT * FROM profiles WHERE role = 'admin';
   ```

### Demo Mode Management

1. **Enable Demo Mode**
   ```sql
   -- Through SQL:
   SELECT toggle_demo_mode(true);
   
   -- Or through Admin UI:
   -- Use DemoModeToggle component
   ```

2. **Configure Demo Password**
   ```sql
   -- Set secure demo password
   SELECT set_demo_password('your_secure_password');
   ```

3. **Monitor Demo Usage**
   ```sql
   -- Check demo accounts
   SELECT * FROM profiles 
   WHERE email LIKE 'demo.%@example.com';
   ```

### Maintenance Tasks

1. **Regular Updates**
   ```bash
   # Update dependencies
   npm audit
   npm update
   ```

2. **Log Management**
   - Configure log retention
   - Monitor error rates
   - Set up alerts

3. **Performance Optimization**
   - Monitor client-side performance
   - Optimize database queries
   - Cache management

## Troubleshooting

### Common Issues

1. **Database Connectivity**
   ```sql
   -- Check connection count
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Authentication Issues**
   - Verify JWT configuration
   - Check auth settings in Supabase
   - Monitor auth logs

3. **Performance Problems**
   ```sql
   -- Identify slow queries
   SELECT * FROM pg_stat_activity
   WHERE state = 'active'
   ORDER BY duration DESC;
   ```

### Emergency Procedures

1. **System Recovery**
   ```sql
   -- Restore from backup
   -- Verify data integrity
   -- Test application functionality
   ```

2. **Security Incidents**
   - Incident response plan
   - Communication procedures
   - Recovery steps

## Monitoring & Alerts

### Key Metrics

1. **System Health**
   - CPU usage
   - Memory utilization
   - Disk space
   - Response times

2. **Application Metrics**
   - Active users
   - Error rates
   - API response times
   - Failed authentications

3. **Database Metrics**
   - Connection count
   - Query performance
   - Cache hit ratio
   - Table sizes

### Alert Configuration

1. **Critical Alerts**
   - Authentication failures
   - API errors
   - Database issues
   - Security violations

2. **Warning Alerts**
   - High resource usage
   - Slow queries
   - Unusual activity patterns

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session management
- Cache strategy
- Database replication

### Vertical Scaling
- Resource allocation
- Database optimization
- Query performance
- Connection pooling

## Disaster Recovery

### Backup Strategy
1. Database backups
2. Configuration backups
3. User data preservation
4. Recovery procedures

### Recovery Testing
1. Regular restore tests
2. Failover procedures
3. Data integrity verification
4. System validation

## Support Contacts

### Technical Support
- System Administrator: sysadmin@ipmanager.com
- Database Administrator: dba@ipmanager.com
- Security Team: security@ipmanager.com

### Emergency Contacts
- On-call Support: +1-XXX-XXX-XXXX
- Emergency Email: emergency@ipmanager.com

---

**Note**: Keep this manual updated with any system changes or new procedures. Regular reviews and updates ensure accurate documentation for system administration.