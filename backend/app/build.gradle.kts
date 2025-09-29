plugins {
    kotlin("jvm") version "2.2.0"
    id("com.gradleup.shadow") version "9.0.0" // For fat JAR
}

group = "com.preanesth"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib"))
    implementation("com.amazonaws:aws-lambda-java-core:1.2.3")
    implementation("com.amazonaws:aws-lambda-java-events:3.12.0")

    // Kotlin test dependencies
    testImplementation(kotlin("test"))  // provides kotlin.test.*
    
    // JUnit 5
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.10.0")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.10.0")
}

// Shadow JAR configuration
tasks {
    shadowJar {
        archiveBaseName.set("lambda-handlers")
        archiveClassifier.set("")
        archiveVersion.set("1.0.0")
    }

    build {
        dependsOn(shadowJar)
    }

    test {
        useJUnitPlatform() // important for JUnit 5
    }
}