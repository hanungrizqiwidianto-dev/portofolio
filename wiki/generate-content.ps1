# PowerShell script to populate all wiki pages with comprehensive content

$contentTemplates = @{
    "authentication" = @{
        title = "Authentication & Authorization"
        category = "Backend Development"
        badge = "backend"
        overview = "Authentication verifies who you are, while Authorization determines what you can do. Learn industry-standard practices for securing your applications."
        keyPoints = @(
            "JWT (JSON Web Tokens) for stateless authentication",
            "OAuth 2.0 and OpenID Connect for third-party auth",
            "Role-Based Access Control (RBAC)",
            "Multi-Factor Authentication (MFA)",
            "Password hashing with bcrypt or Argon2",
            "Session management and token refresh strategies"
        )
    }
    
    "caching" = @{
        title = "Caching Strategies"
        category = "Backend Development"
        badge = "backend"
        overview = "Caching improves application performance by storing frequently accessed data in memory. Learn different caching patterns and when to use them."
        keyPoints = @(
            "Cache-Aside (Lazy Loading) pattern",
            "Write-Through and Write-Behind caching",
            "Time-To-Live (TTL) strategies",
            "Redis and Memcached implementation",
            "Distributed caching for scalability",
            "Cache invalidation patterns"
        )
    }
    
    "database-optimization" = @{
        title = "Database Optimization"
        category = "Backend Development"
        badge = "backend"
        overview = "Optimize database performance through indexing, query optimization, and proper schema design. Learn techniques to handle millions of records efficiently."
        keyPoints = @(
            "Index optimization (B-Tree, Hash, Full-Text)",
            "Query optimization and execution plans",
            "Normalization vs Denormalization",
            "Connection pooling",
            "Partitioning and sharding",
            "N+1 query problem solutions"
        )
    }
    
    "message-queues" = @{
        title = "Message Queues"
        category = "Backend Development"
        badge = "backend"
        overview = "Message queues enable asynchronous communication between services. Learn popular message brokers and messaging patterns."
        keyPoints = @(
            "RabbitMQ, Apache Kafka, Azure Service Bus",
            "Pub/Sub vs Point-to-Point messaging",
            "Message acknowledgment and retry logic",
            "Dead Letter Queues (DLQ)",
            "Event-driven architecture",
            "Exactly-once delivery guarantees"
        )
    }
    
    "aspnet-core" = @{
        title = "ASP.NET Core"
        category = ".NET Development"
        badge = "dotnet"
        overview = "ASP.NET Core is a cross-platform, high-performance framework for building modern web applications and APIs."
        keyPoints = @(
            "Dependency Injection built-in",
            "Middleware pipeline",
            "Model-View-Controller (MVC) pattern",
            "Razor Pages for simpler scenarios",
            "Built-in logging and configuration",
            "Cross-platform (Windows, Linux, macOS)"
        )
    }
    
    "ef-core" = @{
        title = "Entity Framework Core"
        category = ".NET Development"
        badge = "dotnet"
        overview = "EF Core is a modern Object-Relational Mapper (ORM) for .NET. It enables .NET developers to work with databases using .NET objects."
        keyPoints = @(
            "Code-First and Database-First approaches",
            "LINQ queries for type-safe data access",
            "Migration for schema changes",
            "Lazy loading, eager loading, explicit loading",
            "DbContext and connection pooling",
            "Performance optimization techniques"
        )
    }
}

# Generate content for each template
foreach ($page in $contentTemplates.Keys) {
    $template = $contentTemplates[$page]
    
    $content = @"
                <section class="doc-section">
                    <h2>Overview</h2>
                    <p>
                        $($template.overview)
                    </p>
                    <div class="info-box">
                        <i class="fas fa-lightbulb"></i>
                        <div>
                            <strong>Key Topic:</strong> Understanding $($template.title) is essential for modern backend development.
                        </div>
                    </div>
                </section>

                <section class="doc-section">
                    <h2>Key Concepts</h2>
                    <div class="checklist">
"@
    
    foreach ($point in $template.keyPoints) {
        $content += @"

                        <div class="checklist-item">
                            <i class="fas fa-check-circle"></i>
                            <span>$point</span>
                        </div>
"@
    }
    
    $content += @"

                    </div>
                </section>

                <section class="doc-section">
                    <h2>Implementation Guide</h2>
                    <p>
                        Detailed implementation examples and code snippets for $($template.title) are available in the source code examples section.
                    </p>
                    <div class="example-box">
                        <h4>Best Practices</h4>
                        <ul>
                            <li>Follow industry standards and security guidelines</li>
                            <li>Implement proper error handling and logging</li>
                            <li>Write unit and integration tests</li>
                            <li>Document your API and code</li>
                            <li>Monitor performance and optimize bottlenecks</li>
                        </ul>
                    </div>
                </section>

                <section class="doc-section">
                    <h2>Further Reading</h2>
                    <ul>
                        <li>Official documentation and API references</li>
                        <li>Community best practices and patterns</li>
                        <li>Real-world case studies</li>
                        <li>Performance benchmarks and optimization guides</li>
                    </ul>
                </section>
"@
    
    Write-Host "Generated content for: $page" -ForegroundColor Green
    # Store content for later use
    $contentTemplates[$page].generatedContent = $content
}

Write-Host "`nContent templates generated successfully!" -ForegroundColor Cyan
Write-Host "Total templates: $($contentTemplates.Count)" -ForegroundColor Cyan
