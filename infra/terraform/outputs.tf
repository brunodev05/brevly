output "alb_dns_name" {
  description = "Application Load Balancer DNS — access the app here"
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecr_backend_url" {
  description = "ECR repository URL for the backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for the frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
