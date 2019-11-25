package beans;


import javax.annotation.PostConstruct;
import javax.faces.context.ExternalContext;
import javax.faces.context.FacesContext;
import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class HistoryService {

    private Connection connection;

    public HistoryService() {}

    @PostConstruct
    private void initConnection() {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("Can't find driver!!!", e);
        }

        ExternalContext context = FacesContext.getCurrentInstance().getExternalContext();
        String jdbcProtocolName = context.getInitParameter("jdbc-protocol-name");
        String jdbcHost = context.getInitParameter("jdbc-host");
        String jdbcPort = context.getInitParameter("jdbc-port");
        String jdbcDatabase = context.getInitParameter("jdbc-database");
        String jdbcUser = context.getInitParameter("jdbc-user");
        String jdbcPassword = context.getInitParameter("jdbc-password");

        try {
            connection = DriverManager.getConnection(
                    "jdbc:" + jdbcProtocolName + "://" + jdbcHost + ":" + jdbcPort + "/" + jdbcDatabase,
                    jdbcUser, jdbcPassword
            );

            connection.createStatement().execute(
                    "create table if not exists results (" +
                            "x text, y text, r text, result boolean)"
            );
        } catch (SQLException e) {
            throw new IllegalStateException("Could not create connection!!!", e);
        }
    }

    public void addResult(HistoryBean.Query result) throws SQLException {
        if (connection == null)
            initConnection();
        PreparedStatement s = connection.prepareStatement(
                "insert into results (x, y, r, result) values (?, ?, ?, ?)"
        );
        s.setString(1, result.getX());
        s.setString(2, result.getY());
        s.setString(3, result.getR());
        s.setBoolean(4, result.isResult());
        s.execute();
    }

    public LinkedList<HistoryBean.Query> getResults() {
        if (connection == null)
            initConnection();
        LinkedList<HistoryBean.Query> result = new LinkedList<>();
        try{
        ResultSet rs = connection.createStatement().executeQuery("select * from results");
        while (rs.next()) {
            HistoryBean.Query current = new HistoryBean.Query(
                    (rs.getString("x")),
                    (rs.getString("y")),
                    (rs.getString("r")),
                    (rs.getBoolean("result")));
            result.add(current);
        }}
        catch (SQLException ignored){}
        return result;
    }

}
