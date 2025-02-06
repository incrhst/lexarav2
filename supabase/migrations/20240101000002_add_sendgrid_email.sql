-- Create a function to send emails via SendGrid API
CREATE OR REPLACE FUNCTION auth.send_email(
  to_email text,
  subject text,
  content text,
  is_html boolean DEFAULT false
) RETURNS json AS $$
DECLARE
  sendgrid_key text;
  sendgrid_url text := 'https://api.sendgrid.com/v3/mail/send';
  request json;
  result json;
BEGIN
  -- Get SendGrid API key from environment variable
  sendgrid_key := current_setting('app.settings.sendgrid_api_key', true);
  
  -- Construct request payload
  request := json_build_object(
    'personalizations', json_build_array(
      json_build_object(
        'to', json_build_array(
          json_build_object('email', to_email)
        )
      )
    ),
    'from', json_build_object('email', 'alerts@lexara.work'),
    'subject', subject,
    'content', json_build_array(
      json_build_object(
        'type', CASE WHEN is_html THEN 'text/html' ELSE 'text/plain' END,
        'value', content
      )
    )
  );

  -- Send request to SendGrid API
  SELECT content::json INTO result
  FROM http((
    'POST',
    sendgrid_url,
    ARRAY[
      ('Authorization', 'Bearer ' || sendgrid_key),
      ('Content-Type', 'application/json')
    ],
    'application/json',
    request::text
  )::http_request);

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 