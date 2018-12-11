FROM maven:3.6-jdk-8
RUN apt-get update && apt-get -y install git
WORKDIR /opt
RUN git clone https://github.com/swagger-api/swagger-codegen
WORKDIR /opt/swagger-codegen
RUN mvn clean package -Dsurefire.useSystemClassLoader=false
COPY ./swagger.yml /opt
WORKDIR /html
RUN java -jar /opt/swagger-codegen/modules/swagger-codegen-cli/target/swagger-codegen-cli.jar generate \
   -i /opt/swagger.yml \
   -l html

CMD tail -f /dev/null
